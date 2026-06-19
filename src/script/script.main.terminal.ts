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
import { show } from "@tauri-apps/api/app";

let currentPlaceholder: string = "";
let isPlaceholderVisible: boolean = false;

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

listen("terminal_error", async (error) => {
    console.log(error);
    try {
        const response = await invoke("ask_ai", { data: `Read the error message the user received and issue the correct command to prevent the error from recurring. Current Error Message: ${error.payload}` });
        showPlaceholder(response as string);
    } catch (error) {
        console.error(error);
    }
});

term.onKey(async (event) => {
    const ev = event.domEvent;
    if (isPlaceholderVisible && ev.key === "ArrowRight") {
        clearPlaceholder();
        await invoke("inject_str", { data: currentPlaceholder });
        currentPlaceholder = "";
        ev.preventDefault();
        return;
    }
})

term.onData(async (data) => {
    if (isPlaceholderVisible) {
        clearPlaceholder();
    }
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

const showPlaceholder = (data: string) => {
    if (isPlaceholderVisible) return;
    currentPlaceholder = data;
    const currentFormat = `\x1b[s\x1b[90m${currentPlaceholder}\x1b[0m\x1b[u`;
    term.write(currentFormat);
    isPlaceholderVisible = true;
}

const clearPlaceholder = () => {
    if (!isPlaceholderVisible) return;
    if (currentPlaceholder == "") return;
    const textLength = currentPlaceholder.length;
    const spaces = " ".repeat(textLength);
    term.write(`\x1b[s${spaces}\x1b[u`);
    isPlaceholderVisible = false;
}

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