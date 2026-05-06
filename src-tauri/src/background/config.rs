use std::fs;
use serde_json;
use serde::{Deserialize, Serialize};

static _PATH_: &str = "terux_config.json";

#[derive(Deserialize, Serialize, Debug)]
pub struct UserConfig {
    pub alias: String,
    pub theme: String,
    pub font: String,
    pub telemetry: bool,
    pub onboarding_complete: bool
}

impl UserConfig {
    pub fn get_data() -> Self {
        let file: String = fs::read_to_string(_PATH_).expect("config.rs -> get_data() -> fs::read_to_string error");
        let json_object: UserConfig = serde_json::from_str(&file).expect("config.rs -> get_data() -> serde_json::from_str error");
        json_object
    }
    pub fn save_data(&self) {
        let string_data: String = serde_json::to_string_pretty(self).expect("config.rs -> save_data() -> serde_json::to_string_pretty error");
        fs::write(_PATH_, string_data).unwrap();
    }
}