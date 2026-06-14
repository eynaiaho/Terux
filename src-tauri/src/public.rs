use crate::background::config;
use crate::core::{ai, pty_manager};
use crate::AppData;
use serde_json;
use tauri::{AppHandle, Manager, Runtime, WebviewWindow};

#[tauri::command]
pub async fn send_user_data(
    state: tauri::State<'_, AppData>,
    handle: AppHandle,
    data: String,
) -> Result<bool, String> {
    let mut config = state.user_config.lock().await;
    let my_data: config::UserConfig = serde_json::from_str(&data).unwrap();
    my_data.save_data(&handle);
    *config = my_data;
    let ai = config.ai.clone();
    drop(config);
    let welcome_window = handle.get_webview_window("welcome");
    if let Some(main_window) = handle.get_webview_window("main") {
        let _ = main_window.eval("window.location.reload()");
        let _ = main_window.show();
    }
    let rx_ai = state.pipe_ai_rx.lock().await.take();
    let ai_handle = handle.clone();
    if let Some(rx) = rx_ai {
        let ai_tx_ai = state.pipe_ai_tx.clone();
        tauri::async_runtime::spawn(async move {
            let _ = ai::start_ai(ai, rx, ai_tx_ai, ai_handle).await;
        });
    }
    let rx_terminal = state.pipe_terminal_rx.lock().await.take();
    let pty_handle = handle.clone();
    if let Some(rx) = rx_terminal {
        let pty_tx_terminal = state.pipe_terminal_tx.clone();
        let pty_tx_ai = state.pipe_ai_tx.clone();
        let current_path_tx = state.current_path_tx.clone();
        tauri::async_runtime::spawn(async move {
            pty_manager::start_terminal(rx, pty_tx_terminal, pty_tx_ai, current_path_tx, pty_handle).await;
        });
    }
    let _ = welcome_window.unwrap().close();
    Ok(true)
}

pub async fn control_user<R: Runtime>(app: &AppHandle<R>) -> bool {
    let app_data = app.state::<AppData>().inner();
    let user_data = app_data.user_config.lock().await;
    user_data.onboarding_complete
}

pub fn create_welcome_window<R: Runtime>(app: &AppHandle<R>) -> WebviewWindow<R> {
    let webview_window = tauri::WebviewWindowBuilder::new(
        app,
        "welcome",
        tauri::WebviewUrl::App("src/index.welcome.html".into()),
    )
    .inner_size(700.0, 600.0)
    .center()
    .decorations(false)
    .build()
    .unwrap();
    webview_window
}
