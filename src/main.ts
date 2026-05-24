// xterm
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";

// @ts-expect-error: CSS import is handled by bundler
import "@xterm/xterm/css/xterm.css";

// tauri
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";

// other
import { declarePanic } from "./services";

let smartStatus: Boolean = false;

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
});

const smartButton = document.getElementById("smartButton");

document.getElementById("smartButton")?.addEventListener("click", () => {
    smartMode(!smartStatus);
});

const smartMode = (status: Boolean) => {
    smartStatus = status;
    if(smartStatus && smartButton) {
        smartButton.style.filter = "brightness(1.4)";
    } else if(smartButton) {
        smartButton.style.filter = "brightness(1)";
    }
}

let aiInputBuffer = "";
term.onData(async (data) => {
    if (smartStatus) {
        if (data === "\r") {
            const query = aiInputBuffer;
            aiInputBuffer = "";
            smartMode(false);

            term.write("\r\n\x1b[33m[AI Düşünüyor...]\x1b[0m\r\n");

            const response = await invoke("ask_ai", { data: query });

            await invoke("inject_str", { data: response });
        } else if (data === "\x7F") {
            if (aiInputBuffer.length > 0) {
                aiInputBuffer = aiInputBuffer.slice(0, -1);
                term.write("\b \b");
            }
        } else {
            aiInputBuffer += data;
            term.write(data);
        }
        return;
    }
    await invoke("inject_str", { data: data });
});

listen("bc-terminal-data", (data) => {
    const payload = data?.payload;
    if (typeof payload === "string") {
        term.write(payload);
    }
});

// listeners

window.onResized(() => {
    fitAddon.fit();
});

document.querySelector(".navbar-right-hide")?.addEventListener("click", async () => {
    await window.minimize();
});

document.querySelector(".navbar-right-screen")?.addEventListener("click", async () => {
    await window.toggleMaximize();
});

document.querySelector(".navbar-right-exit")?.addEventListener("click", async () => {
    const response = await invoke("send_user_data", { data: JSON.stringify({ alias: "naberlo", a: "sgadgsd" }) });
    console.log(response)
});