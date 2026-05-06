use serde_json;
use tauri::{AppHandle, Manager, Runtime, WebviewWindow};
use crate::background::config;
use crate::AppData;

#[tauri::command]
pub async fn send_user_data(state: tauri::State<'_, AppData>, handle: AppHandle, data: String) -> Result<bool, String> {
    let mut _config = state.user_config.lock().await;
    let my_data: config::UserConfig = serde_json::from_str(&data).unwrap();
    my_data.save_data();
    *_config = my_data;
    let main_window = handle.get_webview_window("main");
    let welcome_window = handle.get_webview_window("welcome");
    let _ = main_window.unwrap().show();
    let _ = welcome_window.unwrap().close();
    Ok(true)
}

pub async fn control_user<R: Runtime>(app: &AppHandle<R>) -> bool {
    let app_data = app.state::<AppData>().inner();
    let user_data = app_data.user_config.lock().await;
    user_data.onboarding_complete
}

pub fn create_welcome_window<R: Runtime>(app: &AppHandle<R>) -> WebviewWindow<R> {
    let webview_window = tauri::WebviewWindowBuilder::new(app, "welcome", tauri::WebviewUrl::App("../src/welcome/index.html".into())).inner_size(700.0, 600.0).center().decorations(false).build().unwrap();
    webview_window
}