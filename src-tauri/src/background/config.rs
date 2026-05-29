use serde::{Deserialize, Serialize};
use serde_json;
use std::fs;
use tauri::{AppHandle, Manager};

static _PATH_: &str = "terux_config.json";

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Ai {
    pub api: String,
    pub model: String,
    pub service: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct UserConfig {
    pub alias: String,
    pub theme: String,
    pub font: String,
    pub ai: Ai,
    pub telemetry: bool,
    pub onboarding_complete: bool,
}

impl UserConfig {
    pub fn get_data(handle: &AppHandle) -> Self {
        let config = handle.path().app_config_dir().unwrap();

        if !config.exists() {
            let _ = fs::create_dir_all(&config);
        }

        let config_file = config.join("terux_config.json");

        if !config_file.exists() {
            let default_settings = Self::default_config();
            let string_json_format = serde_json::to_string_pretty(&default_settings).unwrap();
            let _ = fs::write(config_file, string_json_format);
            default_settings
        } else {
            let file_data = fs::read_to_string(config_file).unwrap();
            let file_data_json_object: UserConfig = serde_json::from_str(&file_data).unwrap();
            file_data_json_object
        }
    }
    pub fn save_data(&self, _handle: &AppHandle) {
        let config = _handle.path().app_config_dir().unwrap();

        if !config.exists() {
            eprintln!("Klasör bulunamadı. | Uyumsuz: Önceden oluşturulması gerekiyordu.");
            return;
        }

        let config_file = config.join("terux_config.json");

        if !config_file.exists() {
            eprintln!("Dosya bulunamadı. | Uyumsuz: Önceden oluşturulması gerekiyordu.");
            return;
        }

        let json_to_string_data: String = serde_json::to_string_pretty(&self).unwrap();

        fs::write(config_file, json_to_string_data).unwrap();
    }
    pub fn default_config() -> Self {
        Self {
            alias: String::from(""),
            theme: String::from(""),
            font: String::from(""),
            ai: Ai {
                api: String::from(""),
                model: String::from(""),
                service: String::from(""),
            },
            telemetry: false,
            onboarding_complete: false,
        }
    }
}
