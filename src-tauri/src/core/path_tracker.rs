pub struct PathTracker {
    state: usize,
    collected_bytes: Vec<u8>,
    pub current_path: String,
}

impl PathTracker {
    pub fn new() -> Self {
        Self {
            state: 0,
            collected_bytes: Vec::new(),
            current_path: String::new(),
        }
    }
    pub fn process_byte(&mut self, b: u8) {
        match self.state {
            0 => {
                if b == 0x1b {
                    self.state = 1;
                }
            }
            1 => {
                if b == b']' {
                    self.state = 2;
                } else {
                    self.state = 0;
                }
            }
            2 => {
                if b == b'7' {
                    self.state = 3;
                } else {
                    self.state = 0;
                }
            }
            3 => {
                if b == b';' {
                    self.state = 4;
                    self.collected_bytes.clear();
                } else {
                    self.state = 0;
                }
            }
            4 => {
                if b == 0x07 || b == 0x1b {
                    self.parse_path();
                    self.state = 0;
                } else {
                    self.collected_bytes.push(b);
                }
            },
            _ => self.state = 0
        }
    }
    pub fn parse_path(&mut self) {
        if let Ok(raw_str) = String::from_utf8(self.collected_bytes.clone()) {
            if let Some(pos) = raw_str.find("file://") {
                let part_str = &raw_str[pos + 7..];
                if let Some(slash) = part_str.find("/") {
                    let mut path = part_str[slash..].to_string();

                    if path.starts_with("/") && path.chars().nth(2) == Some(':') {
                        path.remove(0);
                    }

                    self.current_path = path;
                }
            }
        }
    }
}
