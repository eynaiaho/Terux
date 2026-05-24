use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use tauri::{AppHandle, Emitter};
use tokio::sync::{mpsc::Receiver, mpsc::Sender};

use std::io::Write;

use crate::AiAsk;

pub async fn start_terminal(
    mut rx: Receiver<String>,
    _tx: Sender<String>,
    _tx_ai: Sender<AiAsk>,
    app: AppHandle,
) {
    let pty_system = native_pty_system();

    let pair = pty_system
        .openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_height: 0,
            pixel_width: 0,
        })
        .unwrap();

    let cmd = CommandBuilder::new("cmd.exe");
    let _child = pair.slave.spawn_command(cmd).unwrap();

    let mut reader = pair.master.try_clone_reader().unwrap();
    let mut writer = pair.master.take_writer().unwrap();

    let mut reader_task = tokio::task::spawn_blocking(move || {
        let mut buffer = [0u8; 4096];
        let mut _stdout = std::io::stdout();
        loop {
            match reader.read(&mut buffer) {
                Ok(0) => break,
                Ok(n) => {
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
