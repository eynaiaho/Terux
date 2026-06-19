pub struct ErrorTracker {
    state: usize,
    collected_bytes: Vec<u8>,
    pub error: String,
    pub has_new_error: bool
}

impl ErrorTracker {
    pub fn new() -> Self {
        Self {
            state: 0,
            collected_bytes: Vec::new(),
            error: String::new(),
            has_new_error: false
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
                if b == b'9' {
                    self.state = 3;
                } else {
                    self.state = 0;
                }
            }
            3 => {
                if b == b'9' {
                    self.state = 4;
                } else {
                    self.state = 0;
                }
            }
            4 => {
                if b == b';' {
                    self.state = 5;
                    self.collected_bytes.clear();
                } else {
                    self.state = 0;
                }
            }
            5 => {
                if b == 0x07 || b == 0x1b {
                    self.parse_error();
                    self.state = 0;
                } else {
                    self.collected_bytes.push(b);
                }
            },
            _ => self.state = 0
        }
    }
    pub fn parse_error(&mut self) {
        if let Ok(raw_str) = String::from_utf8(self.collected_bytes.clone()) {
            println!("hata: {}", &raw_str);
            self.has_new_error = true;
            self.error = raw_str;
        }
    }

    pub fn clear_error(&mut self) {
        self.has_new_error = false;
        self.error.clear();
    }
}
