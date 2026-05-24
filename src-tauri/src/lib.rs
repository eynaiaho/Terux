use std::env;
use tokio::sync::{mpsc, mpsc::Sender, Mutex};
use std::sync::Arc;

use tauri::{Manager, WebviewWindow};

pub mod background;
mod commands;
mod core;
mod public;
mod ui;

pub struct AiAsk {
    pub query: String,
    pub reply_tx: tokio::sync::oneshot::Sender<String>
}

pub struct AppData {
    user_config: Arc<Mutex<background::config::UserConfig>>,
    pipe_terminal_tx: Sender<String>,
    pipe_ai_tx: Sender<AiAsk>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            public::send_user_data,
            commands::terminal_commands::inject_str,
            commands::terminal_commands::ask_ai,
        ])
        .setup(|app| {
            let handle = app.handle().clone();

            let (tx_terminal, rx_terminal) = mpsc::channel::<String>(100);
            let (tx_ai, rx_ai) = mpsc::channel::<AiAsk>(100);
            
            let user_config_data = background::config::UserConfig::get_data();
            let ai_data = user_config_data.ai.clone();

            app.manage(AppData {
                user_config: Arc::new(Mutex::new(user_config_data)),
                pipe_terminal_tx: tx_terminal.clone(),
                pipe_ai_tx: tx_ai.clone(),
            });

            let pty_handle = handle.clone();
            let pty_tx_terminal = tx_terminal.clone();
            let pty_tx_ai = tx_ai.clone();
            tokio::spawn(async move {
                core::pty_manager::start_terminal(rx_terminal, pty_tx_terminal, pty_tx_ai, pty_handle).await;
            });

            let ai_handle = handle.clone();
            let ai_tx_ai = tx_ai.clone();
            tauri::async_runtime::spawn(async move {
                let _ = core::ai::start_ai(ai_data, rx_ai, ai_tx_ai, ai_handle).await;
            });

            let window_handle = handle.clone();
            tokio::spawn(async move {
                let is_login = public::control_user(&window_handle).await;
                match is_login {
                    true => {
                        if let Some(window) = handle.get_webview_window("main") {
                            let _ = window.show();
                        }
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
