use std::env;

use tauri::Manager;
mod ui;
use tauri::menu::*;

#[tauri::command]
fn get_dir() -> String {
  match env::current_dir() {
    Ok(path) => path.display().to_string(),
    Err(_) => String::from("Bilinmeyen konum")
  }
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_dir])
    .setup(|app| {
      


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
