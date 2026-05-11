use conpty::Process;
use std::process::Command;
use std::io::{Read, Write};
use std::time::Duration;
use tokio;

pub async fn start_terminal() {
    let mut cmd = Command::new("cmd.exe");
    cmd.env("TERM", "xterm-256color");

    let mut process = Process::spawn(cmd).unwrap();
    
    let mut reader = process.output().unwrap();
    let mut writer = process.input().unwrap();

    tokio::spawn(async move {
        let mut buffer = [0u8; 8192];
        while let Ok(n) = reader.read(&mut buffer) {
            if n == 0 { break; }
            print!("{}", String::from_utf8_lossy(&buffer[..n]));
            let _ = std::io::stdout().flush();
        }
    });

    std::thread::sleep(Duration::from_secs(2));
    
    let _ = writer.write_all(b"dir\r\n");
    let _ = writer.flush();

    std::thread::sleep(Duration::from_secs(4));
}