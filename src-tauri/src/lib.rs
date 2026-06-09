use portable_pty::MasterPty;
use std::env;
use std::option::Option;
use std::sync::Arc;
use tokio::sync::{mpsc, mpsc::Sender, Mutex};

use tauri::{Manager, WebviewWindow};

pub mod background;
mod commands;
mod core;
mod public;
mod ui;

pub struct AiAsk {
    pub query: String,
    pub reply_tx: tokio::sync::oneshot::Sender<String>,
}

pub struct AppData {
    user_config: Arc<Mutex<background::config::UserConfig>>,
    program_config: Arc<Mutex<background::config::ProgramConfig>>,
    pipe_terminal_tx: Sender<String>,
    pipe_terminal_rx: Arc<Mutex<Option<mpsc::Receiver<String>>>>,
    pipe_ai_tx: Sender<AiAsk>,
    pipe_ai_rx: Arc<Mutex<Option<mpsc::Receiver<AiAsk>>>>,
    terminal: Arc<Mutex<Option<Box<dyn MasterPty + Send>>>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            public::send_user_data,
            commands::terminal_commands::inject_str,
            commands::terminal_commands::ask_ai,
            commands::terminal_commands::resize_pty,
            commands::terminal_commands::get_user_config,
            commands::terminal_commands::save_user_config
        ])
        .setup(|app| {
            let handle = app.handle().clone();

            let (tx_terminal, rx_terminal) = mpsc::channel::<String>(100);
            let (tx_ai, rx_ai) = mpsc::channel::<AiAsk>(100);

            let user_config_data = background::config::UserConfig::get_data(&handle);
            let program_config_data = background::config::ProgramConfig::detect();

            let ai_data = user_config_data.ai.clone();

            app.manage(AppData {
                user_config: Arc::new(Mutex::new(user_config_data)),
                program_config: Arc::new(Mutex::new(program_config_data)),
                pipe_terminal_tx: tx_terminal.clone(),
                pipe_terminal_rx: Arc::new(Mutex::new(Some(rx_terminal))),
                pipe_ai_tx: tx_ai.clone(),
                pipe_ai_rx: Arc::new(Mutex::new(Some(rx_ai))),
                terminal: Arc::new(Mutex::new(None)),
            });

            let pty_handle = handle.clone();
            let pty_tx_terminal = tx_terminal.clone();
            let pty_tx_ai = tx_ai.clone();

            let ai_handle = handle.clone();
            let ai_tx_ai = tx_ai.clone();
            let window_handle = handle.clone();
            tokio::spawn(async move {
                let is_login = public::control_user(&window_handle).await;
                match is_login {
                    true => {
                        if let Some(window) = handle.get_webview_window("main") {
                            let _ = window.show();
                        }
                        let terminal_handle = handle.clone();
                        tauri::async_runtime::spawn(async move {
                            let rx_terminal = terminal_handle
                                .state::<AppData>()
                                .pipe_terminal_rx
                                .lock()
                                .await
                                .take();
                            if let Some(rx) = rx_terminal {
                                core::pty_manager::start_terminal(
                                    rx,
                                    pty_tx_terminal,
                                    pty_tx_ai,
                                    pty_handle,
                                )
                                .await;
                            }
                        });
                        tauri::async_runtime::spawn(async move {
                            let rx_ai = window_handle
                                .state::<AppData>()
                                .pipe_ai_rx
                                .lock()
                                .await
                                .take();
                            if let Some(rx) = rx_ai {
                                let _ = core::ai::start_ai(ai_data, rx, ai_tx_ai, ai_handle).await;
                            }
                        });
                    }
                    false => {
                        let _: WebviewWindow = public::create_welcome_window(&handle);
                    }
                }
            });
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
