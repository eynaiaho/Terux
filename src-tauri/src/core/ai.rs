use llm::{
    builder::{LLMBackend, LLMBuilder}, chat::ChatMessage
};
use tauri::{AppHandle, Emitter, Manager};
use std::{sync::Arc};
use tokio::sync::Mutex;
use tokio::sync::mpsc::{Receiver, Sender};

use crate::{AiAsk, AppData, background::config::Ai};

pub async fn start_ai(ai: Ai, mut rx_ai: Receiver<AiAsk>, _tx_ai: Sender<AiAsk>, app: AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let current_service: LLMBackend = {
        let mut service: LLMBackend = LLMBackend::Anthropic;
        if ai.service == "Gemini" {
            service = LLMBackend::Google;
        } else if ai.service == "Groq" {
            service = LLMBackend::Groq;
        } else if ai.service == "Claude" {
            service = LLMBackend::Anthropic;
        } else if ai.service == "DeepSeek" {
            service = LLMBackend::DeepSeek;
        }
        service
    };

    let state = app.state::<AppData>();
    let program_config_arc = state.program_config.clone();
    let program_config = program_config_arc.lock().await;
    let os = program_config.os.clone();
    let cmd = program_config.cmd.clone();
    drop(program_config);

    let system_command = format!("As an AI assistant, the user will ask you to run a terminal command. Receive the user's request and return only the executable command appropriate for the specified operating system and terminal; do not say anything else, otherwise the command you provide will not run in the terminal and will return an error. SYSTEM: {}, TERMINAL: {}", os.to_uppercase(), cmd.unwrap_or(String::from("BASH")).to_uppercase());
    
    let raw_llm = LLMBuilder::new()
        .backend(current_service) 
        .api_key(ai.api) 
        .model(ai.model) 
        .system(system_command)
        .build()
        .unwrap();
    let llm = Arc::new(raw_llm);

    let messager: Arc<Mutex<Vec<ChatMessage>>> = Arc::new(Mutex::new(vec![]));
    //let messager = vec![];
    while let Some(data) = rx_ai.recv().await {
        let messager_clone = messager.clone();
        let llm_clone = llm.clone();
        let app_clone = app.app_handle().clone();

        tokio::spawn(async move {
            let message_content = {
                let mut mc = messager_clone.lock().await;
                mc.push(ChatMessage::user().content(&data.query).build());
                mc.clone()
            };

            match llm_clone.chat(&message_content).await {
                Ok(message) => {
                    let string_message = message.to_string().trim().to_string();
                    {
                        let _ = messager_clone.lock().await.push(ChatMessage::assistant().content(&string_message).build());
                    }
                    let _ = data.reply_tx.send(string_message);
                },
                Err(e) => {
                    let _ = app_clone.emit("ai_error", format!("{:?}", e));
                }
            }
        });
    }

    Ok(())
}