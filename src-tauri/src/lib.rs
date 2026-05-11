use std::env;
use tokio::sync::Mutex;

use tauri::{Manager, WebviewWindow};
pub mod background;
mod public;
mod ui;
mod commands;
mod core;

pub struct AppData {
    user_config: Mutex<background::config::UserConfig>,
}

#[tauri::command]
async fn get_dir() -> String {
    match env::current_dir() {
        Ok(path) => path.display().to_string(),
        Err(_) => String::from("Bilinmeyen konum"),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    let user_config_data = background::config::UserConfig::get_data();
    core::pty_manager::start_terminal();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_dir, public::send_user_data])
        .manage(AppData {
            user_config: Mutex::new(user_config_data),
        })
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let is_login = public::control_user(&handle).await;
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
