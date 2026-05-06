use tauri::{AppHandle, Runtime, menu::MenuEvent, tray::TrayIconBuilder};

fn _tray_on_menu_event<R: Runtime>() -> impl Fn(&AppHandle<R>, MenuEvent) {
    |_app, _event| {
        
    }
}

pub fn _create_tray<R: Runtime>(app_handle: &AppHandle<R>) -> TrayIconBuilder<R> {
    let tray = TrayIconBuilder::new().icon(app_handle.default_window_icon().unwrap().clone());
    tray
}