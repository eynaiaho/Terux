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
import { declarePanic, terminalConfig, smartMode, sendToAI } from "./script.main.utils";

const window = getCurrentWindow();

export const term = new Terminal(terminalConfig());
const fitAddon = new FitAddon();

term.loadAddon(fitAddon);

const terminal = document.getElementById("terminal") || null;

document.fonts.ready.then(async () => {
    if (!terminal) {
        await declarePanic("Terminal not found, will you close the terminal?", true);
        return;
    }
    term.open(terminal)

    try {
        const webglAddon = new WebglAddon();
        term.loadAddon(webglAddon);
    } catch (e) {
        console.warn("Ekran kartı WebGL desteklemiyor, alternatif yöntem çalıştırılacak", e);
    }

    fitAddon.fit();

    await invoke('resize_pty', {
        cols: term.cols,
        rows: term.rows
    });
});

listen("ai_error", (data) => {
    console.error(data)
});

term.onData(async (data) => {
    if (data === "\r") {
        const buffer = term.buffer.active;
        const currentLine = buffer.getLine(buffer.cursorY + buffer.baseY)?.translateToString(true).trim();
        const commandIndex = currentLine?.indexOf("!teruxai");
        if (commandIndex === undefined) return;
        if (commandIndex !== -1) {
            const question = currentLine?.substring((commandIndex || 0) + 8).trim();

            if (!question) return;

            sendToAI(term, question);

            return;
        }
    }
    console.log(data);
    await invoke("inject_str", { data: data });
});

term.attachCustomKeyEventHandler((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'g') {
        smartMode(true);
        return false;
    }
    return true;
});

listen("bc-terminal-data", (data) => {
    const payload = data?.payload;
    if (typeof payload === "string") {
        if (payload.includes("\x1b[2J") || payload.includes("\x1b[H")) {
            term.clear();
        }
        term.write(payload);
    }
});

// listeners

window.onResized(async () => {
    fitAddon.fit();

    await invoke('resize_pty', {
        cols: term.cols,
        rows: term.rows
    });
});

document.querySelector(".navbar-right-hide")?.addEventListener("click", async () => {
    await window.minimize();
});

document.querySelector(".navbar-right-screen")?.addEventListener("click", async () => {
    await window.toggleMaximize();
});

document.querySelector(".navbar-right-exit")?.addEventListener("click", async () => {
    await window.close();
});