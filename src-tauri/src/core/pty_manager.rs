use portable_pty::{native_pty_system, CommandBuilder, PtySize, PtySystem}; // open_pty yerine openpty için trait eklendi
use std::io::{stdin, stdout, Read, Write};
use std::thread;
use std::time::Duration;

pub fn start_terminal() {
    let pty_system = native_pty_system();

    let mut pair = pty_system
        .openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })
        .unwrap();

    let cmd = CommandBuilder::new("cmd.exe");
    let _child = pair.slave.spawn_command(cmd).unwrap();

    let mut reader = pair.master.try_clone_reader().unwrap();
    let mut writer = pair.master.take_writer().unwrap();

    thread::spawn(move || {
        let mut buffer = [0u8; 4096];
        let mut stdout = std::io::stdout();
        loop {
            match reader.read(&mut buffer) {
                Ok(0) => break,
                Ok(n) => {
                    let _ = stdout.write_all(&buffer[..n]);
                    let _ = stdout.flush();
                }
                Err(_) => break,
            }
        }
    });

    writeln!(&mut writer, "dir\r\n").unwrap();

    loop {
        thread::park();
    }
}
