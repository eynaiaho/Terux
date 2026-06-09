use portable_pty::PtySize;
use serde_json;
use tauri::AppHandle;
use tauri::{command, State};
use tokio::sync::oneshot::{self};

use crate::background::config::UserConfig;
use crate::AiAsk;
use crate::AppData;

#[command]
pub async fn inject_str(state: State<'_, AppData>, data: String) -> Result<String, String> {
    let tx = state.pipe_terminal_tx.clone();
    tx.send(data).await.unwrap();

    Ok(String::from("value"))
}

#[command]
pub async fn ask_ai(state: State<'_, AppData>, data: String) -> Result<String, String> {
    let (r_tx, r_rx) = oneshot::channel::<String>();
    let tx = state.pipe_ai_tx.clone();
    let ai_ask = AiAsk {
        query: data,
        reply_tx: r_tx,
    };
    tx.send(ai_ask).await.unwrap();
    match r_rx.await {
        Ok(data) => Ok(data),
        Err(_) => Err("hata".into()),
    }
}

#[command]
pub async fn resize_pty(state: State<'_, AppData>, cols: u16, rows: u16) -> Result<String, String> {
    let raw_terminal = state.terminal.clone();
    let mut terminal_key = raw_terminal.lock().await;
    if let Some(ref mut terminal) = *terminal_key {
        let _ = terminal.resize(PtySize {
            rows: rows,
            cols: cols,
            ..Default::default()
        });
    }
    Ok("slm".to_string())
}

#[command]
pub async fn get_user_config(state: State<'_, AppData>) -> Result<String, String> {
    let raw_data = state.user_config.clone();
    let data = raw_data.lock().await;
    let string_json = serde_json::to_string(&data.clone()).unwrap();
    Ok(string_json)
}

#[command]
pub async fn save_user_config(
    state: State<'_, AppData>,
    data: String,
    handle: AppHandle,
) -> Result<(), String> {
    let raw_data = state.user_config.clone();
    let mut config = raw_data.lock().await;
    let json_data: UserConfig = serde_json::from_str(&data).unwrap();
    let json_data_clone = json_data.clone();
    *config = json_data_clone;
    json_data.save_data(&handle);
    Ok(())
}
