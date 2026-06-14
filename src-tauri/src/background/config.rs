use portable_pty::MasterPty;
use serde::{Deserialize, Serialize};
use serde_json;
use tokio::sync::Mutex;
use std::{fs, sync::Arc};
use tauri::{AppHandle, Manager};

static _PATH_: &str = "terux_config.json";

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Ai {
    pub api: String,
    pub model: String,
    pub service: String,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct UserConfig {
    pub alias: String,
    pub theme: String,
    pub font: String,
    pub ai: Ai,
    pub telemetry: bool,
    pub onboarding_complete: bool,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ProgramConfig {
    pub os: String,
    pub cmd: Option<String>,
}

#[derive(Clone)]
pub struct TerminalConfig {
    pub terminal: Arc<Mutex<Option<Box<dyn MasterPty + Send>>>>,
    pub pid: Arc<Mutex<Option<u32>>>,
}

impl TerminalConfig {
    pub fn get_terminal_config() -> Self {
        Self {
            terminal: Arc::new(Mutex::new(None)),
            pid: Arc::new(Mutex::new(None))
        }
    }
}

impl ProgramConfig {
    pub fn detect() -> Self {
        #[cfg(target_os = "windows")] {
            Self {
                os: String::from("windows"),
                cmd: Some(String::from("powershell.exe")),
            }
        }

        #[cfg(target_os = "linux")] {
            Self {
                os: String::from("linux"),
                cmd: Some(String::from("bash")),
            }
        }

        #[cfg(not(any(target_os = "windows", target_os = "linux")))] {
            Self {
                os: std::env::consts::OS.to_string(),
                cmd: Some(String::from("sh"))
            }
        }
    }
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
    pub fn save_data(&self, handle: &AppHandle) {
        let config = handle.path().app_config_dir().unwrap();

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
