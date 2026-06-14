use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use tauri::{AppHandle, Emitter, Manager};
use tokio::sync::{mpsc::{Receiver, Sender}, watch};

use std::io::Write;

use crate::{core::path_tracker::PathTracker, AiAsk, AppData};

pub async fn start_terminal(
    mut rx: Receiver<String>,
    _tx: Sender<String>,
    _tx_ai: Sender<AiAsk>,
    tx_path: watch::Sender<String>,
    app: AppHandle,
) {
    let app_handle = app.app_handle();
    let pty_system = native_pty_system();

    let state = app.state::<AppData>();
    let alias = state.user_config.clone().lock().await.alias.clone();

    let program_config_arc = state.program_config.clone();
    let program_config = program_config_arc.lock().await;
    let os = program_config.os.clone();
    let current_cmd = program_config.cmd.clone();
    drop(program_config);

    let pair = pty_system
        .openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_height: 0,
            pixel_width: 0,
        })
        .unwrap();

    let prompt_script = format!(
        "Import-Module PSReadLine; function prompt {{ $e=[char]27; \"$e]7;file://localhost/$($pwd.ProviderPath)$e\\$('Terux${} ' + $pwd.Path + '> ')\" }}",
        alias
    );

    let cmd = if let Some(c) = current_cmd {
        let mut program = CommandBuilder::new(c.clone());
        if os == "windows" && c == "powershell.exe" {
            program.args(&["-NoProfile", "-NoExit", "-Command", &prompt_script]);
        } else if os == "windows" && c == "cmd.exe" {
            program.env("PROMPT", format!("$E]7;file//localhost/$P$E\\Terux$${alias} $P$G"));
        } else if os == "linux" && c == "bash" {
            program.env(
                "PS1",
                format!("\\[\\e]7;file://localhost/$PWD\\e\\\\\\]Terux${alias} [\\[\\e[32m\\]\\w\\[\\e[0m\\]] $ "),
            );
        }
        program
    } else {
        CommandBuilder::new("powershell.exe")
    };

    // cmd.env("PROMPT", format!("Terux$${alias} $P$G")); // CMD.EXE
    // cmd.args(&["-NoProfile", "-NoExit", "-Command", &prompt_script]); // POWERSHELL

    let child = pair.slave.spawn_command(cmd).unwrap();

    let mut reader = pair.master.try_clone_reader().unwrap();
    let mut writer = pair.master.take_writer().unwrap();

    let terminal_master = pair.master;
    let process_id = child.process_id().unwrap();

    {
        let terminal_config_arc = app_handle.state::<AppData>().terminal_config.clone();
        let terminal_config = terminal_config_arc.lock().await;

        let terminal_config_master_arc = terminal_config.terminal.clone();
        let mut terminal_config_master = terminal_config_master_arc.lock().await;

        let terminal_config_pid_arc = terminal_config.pid.clone();
        let mut terminal_config_pid = terminal_config_pid_arc.lock().await;

        *terminal_config_master = Some(terminal_master);
        *terminal_config_pid = Some(process_id);
    }

    let mut reader_task = tokio::task::spawn_blocking(move || {
        let mut buffer = [0u8; 4096];
        let mut path_tracker = PathTracker::new();

        let mut current_path = path_tracker.current_path.clone();

        let mut _stdout = std::io::stdout();
        loop {
            match reader.read(&mut buffer) {
                Ok(0) => break,
                Ok(n) => {
                    for &b in &buffer[..n] {
                        path_tracker.process_byte(b);
                    }

                    if current_path != path_tracker.current_path {
                        current_path = path_tracker.current_path.clone();
                        let _ = tx_path.send(current_path.clone());
                    }

                    //stdout.write_all(&buffer[..n]).unwrap();
                    //stdout.flush().unwrap();
                    let string_data = String::from_utf8_lossy(&buffer[..n]).to_string();
                    let _ = app.emit("bc-terminal-data", string_data);
                }
                Err(_) => break,
            }
        }
    });

    let mut writer_task = tokio::spawn(async move {
        while let Some(data) = rx.recv().await {
            writer.write_all(data.as_bytes()).unwrap();
            writer.flush().unwrap();
        }
    });

    tokio::select! {
        _ = &mut reader_task => {
            println!("Thread tamamen kapandı.");
        },
        _ = &mut writer_task => {
            writer_task.abort();
        }
    }
}
