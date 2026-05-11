use tauri::{AppHandle, Runtime, command};

#[command]
fn _inject_str<R: Runtime>(_app: &AppHandle<R>, _data: String) {

}