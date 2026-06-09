import { invoke } from "@tauri-apps/api/core";
import { Window } from "@tauri-apps/api/window";

const progress = document.getElementById("progressBar") as HTMLInputElement;

const buttons = [
    document.getElementById("q1"),
    document.getElementById("q2"),
    document.getElementById("q3"),
    document.getElementById("q4"),
    document.getElementById("q5"),
    document.getElementById("q6")
];

interface AiInputs {
    apiInput: HTMLInputElement;
    modelInput: HTMLInputElement;
    serviceInput: HTMLInputElement
}

interface UserSettings {
    alias: string;
    theme: string;
    font: string;
    ai: {
        api: string;
        model: string;
        service: string;
    };
    telemetry: boolean;
    onboarding_complete: boolean;
}

interface AiObject {
    api: string;
    model: string;
    service: string
}

const aiInputs: AiInputs = {
    apiInput: document.getElementById("aiApiInput") as HTMLInputElement,
    modelInput: document.getElementById("aiModelInput") as HTMLInputElement,
    serviceInput: document.getElementById("aiServiceInput") as HTMLInputElement
}

const userSettings: UserSettings = {
    "alias": "",
    "theme": "",
    "font": "",
    "ai": {
        "api": "",
        "model": "",
        "service": ""
    },
    "telemetry": false,
    "onboarding_complete": false
}

let currentTheme: string = "";
let currentFont: string = "";

document.querySelectorAll('input[type="button"]').forEach(element => {
    element.addEventListener("click", (event) => {
        if (!event.target) return;
        if ((event.target as HTMLInputElement).closest(".theme")) {
            currentTheme = element.id;
        } else if ((event.target as HTMLInputElement).closest(".font")) {
            currentFont = element.id;
        }
        document.querySelectorAll('input[type="button"]').forEach(e => (e as HTMLElement).style.filter = ("brightness(1)"));
        (element as HTMLElement).style.filter = "brightness(0.5)";
    })
});

document.getElementById("alias")?.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;
    if (!target) return;
    const clearText = target.value.replace(/[^a-zA-Z0-9_-]/g, '');
    target.value = clearText.toLowerCase();
});

const getAlias = (): boolean | string => {
    const alias = document.getElementById("alias") as HTMLInputElement ?? "";
    if (!alias) return false;
    return alias.value;
}

const getTheme = (): boolean | string => {
    if (currentTheme === "") return false;
    return currentTheme;
}

const getFont = (): boolean | string => {
    if (currentFont === "") return false;
    return currentFont;
}

const getAI = (): boolean | AiObject => {
    const api = aiInputs.apiInput.value;
    if (!api) return false;
    const model = aiInputs.modelInput.value;
    if (!model) return false;
    const service = aiInputs.serviceInput.value;
    if (!service) return false;

    const aiObject: AiObject = {
        "api": api,
        "model": model,
        "service": service
    }

    return aiObject
}

const getTelemetry = (): boolean => {
    const telemetry = document.getElementById("telemetryCheck");
    return (telemetry as HTMLInputElement).checked;
}

const getSubmits = (currentStage: string, nextStage: string): boolean => {
    switch (currentStage) {
        case "1":
            return true;
        case "2":
            const alias = getAlias();
            if (!alias) return false;
            userSettings.alias = alias.toString();
            return true;
        case "3":
            const theme = getTheme();
            if (!theme) return false;
            userSettings.theme = theme.toString();
            return true;
        case "4":
            const font = getFont();
            if (!font) return false;
            userSettings.font = font.toString();
            return true;
        case "5":
            const aiObject = getAI();
            if(aiObject === false) {
                return false;
            }
            if (aiObject instanceof Object) {
                userSettings.ai.api = aiObject.api;
                userSettings.ai.model = aiObject.model;
                userSettings.ai.service = aiObject.service;
            }
            return true;
        case "6":
            const telemetry = getTelemetry();
            userSettings.telemetry = telemetry;
            return true;
    }

    return false;
}

document.getElementById("exit")?.addEventListener("click", async () => {
    await invoke("exit")
})

const sendError = (data: string, status: boolean = true) => {
    const errorBox = document.getElementById("errorBox") as HTMLSpanElement;
    if (!errorBox) return;

    errorBox.textContent = data;

    if (status === true) {
        errorBox.style.display = "inline";
    } else if (status === false) {
        errorBox.style.display = "none";
    }
}

buttons.forEach(button => {
    button?.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        console.log(target);
        if (!target) return;
        const bodyQ = target?.closest(".body-q");
        if (!bodyQ) return;
        console.log(bodyQ);

        const bodyQNumber = bodyQ.getAttribute("data-q") || "";
        if (!bodyQNumber) return;
        const bodyQNextNumber = (Number(bodyQ.getAttribute("data-q")) + 1).toString();
        const pass = getSubmits(bodyQNumber, bodyQNextNumber);
        console.log(bodyQNumber);
        if (pass === false) {
            sendError("Missing required fields. Please fill out all inputs.");
            return;
        };
        sendError("", false);

        bodyQ.removeAttribute("active");
        progress.value += 20;
        const newBodyQ = document.querySelector(`.q${bodyQNextNumber}`);
        newBodyQ?.setAttribute("active", "");
    });
});

document.getElementById("submit")?.addEventListener("click", async () => {
    if (!userSettings.alias || !userSettings.font || !userSettings.theme || !userSettings.ai) return;
    userSettings.onboarding_complete = true;
    const response = await invoke("send_user_data", { data: JSON.stringify(userSettings) });
    if (response === true) {
        await window.close();
    } else {
        alert("unknow error, please restart the your program")
    }
});

document.querySelectorAll('input[type="button"]').forEach(element => {
    element.addEventListener("click", () => {
        const AiapiInput = document.getElementById("aiApiInput") as HTMLInputElement;
        const AimodelInput = document.getElementById("aiModelInput") as HTMLInputElement;
        const AiServiceInput = document.getElementById("aiServiceInput") as HTMLInputElement;
        switch (element.id) {
            case "gemini":
                AiapiInput.value = "AIza";
                AimodelInput.placeholder = "gemini-3.1-flash-lite";
                AiServiceInput.value = "Gemini";
                break;
            case "claude":
                AiapiInput.value = "sk-ant-";
                AimodelInput.placeholder = "claude-3-haiku";
                AiServiceInput.value = "Claude";
                break;
            case "groq":
                AiapiInput.value = "gsk_";
                AimodelInput.placeholder = "llama-3.1-8b-instant";
                AiServiceInput.value = "Groq";
                break;
            case "deepseek":
                AiapiInput.value = "sk-";
                AimodelInput.placeholder = "deepseek-v4-flash";
                AiServiceInput.value = "DeepSeek";
                break;
        }
    });
});