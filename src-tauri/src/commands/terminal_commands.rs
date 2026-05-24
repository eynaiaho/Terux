use tauri::{command, State};
use tokio::sync::oneshot::{self};

use crate::AppData;
use crate::AiAsk;

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
    let ai_ask = AiAsk {query: data, reply_tx: r_tx};
    tx.send(ai_ask).await.unwrap();
    match r_rx.await {
        Ok(data) => Ok(data),
        Err(_) => Err("hata".into()),
    }
}
