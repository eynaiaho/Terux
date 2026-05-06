// xterm
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";

// @ts-expect-error: CSS import is handled by bundler
import "@xterm/xterm/css/xterm.css";

// tauri
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

// other
import { declarePanic } from "./services";



const window = getCurrentWindow();

let myStorage = "";

const getCSSVar = (varName: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

const myTheme = {
    background: getCSSVar("--background-darker"),
    foreground: getCSSVar("--text"),
    cursor: getCSSVar("--accent"),
    selectionBackground: getCSSVar("--background-lighter"),
    red: getCSSVar("--error"),
    green: getCSSVar("--success")
}

const term = new Terminal({
    cursorBlink: true,
    cursorWidth: 5,

    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 14,
    fontWeight: 'normal',

    convertEol: true,
    allowProposedApi: true,

    theme: myTheme
});
const fitAddon = new FitAddon();

term.loadAddon(fitAddon);

const terminal = document.getElementById("terminal") || null;

document.fonts.load('14px "JetBrains Mono"').then(async () => {
    terminal ? term.open(terminal) : await declarePanic("Terminal not found, will you close the terminal?", true);

    try {
        const webglAddon = new WebglAddon();
        term.loadAddon(webglAddon);
    } catch (e) {
        console.warn("Ekran kartı WebGL dessteklemiyor, alternatif yöntem çalıştırılacak", e);
    }

    fitAddon.fit();

    term.write("Terux Terminal is currently running...\r\n$>");
})

term.onData(async (data) => {
    if (data === '\r') {
        const response = await invoke("get_dir");
        myStorage = "";
        term.write("\r\n" + response + "\r\n$>");
    } if (data === "\x7f") {
        myStorage = myStorage.slice(0, -1);
        term.write("\b \b");
    } else {
        myStorage += data;
        term.write(data);
    }

})

// listeners

window.onResized(() => {
    fitAddon.fit();
})

document.querySelector(".navbar-right-hide")?.addEventListener("click", async () => {
    await window.minimize();
})

document.querySelector(".navbar-right-screen")?.addEventListener("click", async () => {
    await window.toggleMaximize();
})

document.querySelector(".navbar-right-exit")?.addEventListener("click", async () => {
    const response = await invoke("send_user_data", {data: JSON.stringify({alias: "naberlo", a: "sgadgsd"})});
    console.log(response)
})