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
    cloud_ai: {
        apiInput: HTMLInputElement;
        modelInput: HTMLInputElement;
        serviceInput: HTMLInputElement;
        temperatureInput: HTMLInputElement
    },
    local_ai: {
        sourceInput: HTMLInputElement;
        modelInput: HTMLInputElement;
        temperatureInput: HTMLInputElement
    }
}

interface AiMenus {
    cloud_ai: NodeListOf<HTMLElement>;
    local_ai: NodeListOf<HTMLElement>;
}

interface UserSettings {
    alias: string;
    theme: string;
    font: string;
    ai: Ai;
    telemetry: boolean;
    onboarding_complete: boolean;
}

interface Ai {
    active_mode: string;
    local_ai: LocalAi;
    cloud_ai: CloudAi;
}

interface LocalAi {
    source: string;
    model: string;
    temperature: number;
}

interface CloudAi {
    api: string;
    model: string;
    service: string;
    temperature: number;
}

const aiInputs: AiInputs = {
    cloud_ai: {
        apiInput: document.getElementById("cloudaiApiInput") as HTMLInputElement,
        modelInput: document.getElementById("cloudaiModelInput") as HTMLInputElement,
        serviceInput: document.getElementById("cloudaiServiceInput") as HTMLInputElement,
        temperatureInput: document.getElementById("cloudaiTemperatureInput") as HTMLInputElement
    },
    local_ai: {
        sourceInput: document.getElementById("localaiSourceInput") as HTMLInputElement,
        modelInput: document.getElementById("localaiModelInput") as HTMLInputElement,
        temperatureInput: document.getElementById("localaiTemperatureInput") as HTMLInputElement
    }
}

const userSettings: UserSettings = {
    "alias": "",
    "theme": "",
    "font": "",
    "ai": {
        "active_mode": "",
        "local_ai": {
            "source": "",
            "model": "",
            "temperature": 0.0
        },
        "cloud_ai": {
            "api": "",
            "model": "",
            "service": "",
            "temperature": 0.0
        }
    },
    "telemetry": false,
    "onboarding_complete": false
}

let currentTheme: string = "";
let currentFont: string = "";

let currentCloudAiButton = "gemini";
let currentLocalAiButton = "ollama";

const ai_menus: AiMenus = {
    cloud_ai: document.querySelectorAll(".cloud-ai")! as NodeListOf<HTMLElement>,
    local_ai: document.querySelectorAll(".local-ai")! as NodeListOf<HTMLElement>
}

document.querySelectorAll(".terux_settings_menu_button").forEach(elements => {
    elements.addEventListener("click", (event) => {
        const id = (event.target as HTMLButtonElement).id;
        const targetButton = id.split("_")[1];
        if (targetButton === "Ci") {
            selectMenuButton(currentCloudAiButton);
            ai_menus.cloud_ai.forEach((element) => {
                element.setAttribute("active", "");
            });
            ai_menus.local_ai.forEach((element) => {
                element.removeAttribute("active");
            });
        } else if (targetButton === "La") {
            selectMenuButton(currentLocalAiButton);
            ai_menus.local_ai.forEach((element) => {
                element.setAttribute("active", "");
            });
            ai_menus.cloud_ai.forEach((element) => {
                element.removeAttribute("active");
            });
        }
    });
})

const selectMenuButton = (id: string) => {
    document.querySelectorAll('input[type="button"]').forEach(e => {
        (e as HTMLElement).classList.remove("!brightness-50");
    });
    document.getElementById(id)?.classList.add("!brightness-50");
}

const updateAiInputPresets = (id: string) => {
    switch (id) {
        case "gemini":
            aiInputs.cloud_ai.apiInput.value = "AIza";
            aiInputs.cloud_ai.modelInput.placeholder = "gemini-3.1-flash-lite";
            aiInputs.cloud_ai.serviceInput.value = "Gemini";
            currentCloudAiButton = "gemini";
            break;
        case "claude":
            aiInputs.cloud_ai.apiInput.value = "sk-ant-";
            aiInputs.cloud_ai.modelInput.placeholder = "claude-3-haiku";
            aiInputs.cloud_ai.serviceInput.value = "Claude";
            currentCloudAiButton = "claude";
            break;
        case "groq":
            aiInputs.cloud_ai.apiInput.value = "gsk_";
            aiInputs.cloud_ai.modelInput.placeholder = "llama-3.1-8b-instant";
            aiInputs.cloud_ai.serviceInput.value = "Groq";
            currentCloudAiButton = "groq";
            break;
        case "deepseek":
            aiInputs.cloud_ai.apiInput.value = "sk-";
            aiInputs.cloud_ai.modelInput.placeholder = "deepseek-v4-flash";
            aiInputs.cloud_ai.serviceInput.value = "DeepSeek";
            currentCloudAiButton = "deepseek";
            break;
        case "ollama":
            aiInputs.local_ai.sourceInput.placeholder = "http://localhost:11434";
            aiInputs.local_ai.modelInput.placeholder = "Local AI Model Name";
            currentLocalAiButton = "ollama";
    }
}

document.querySelectorAll('input[type="button"]').forEach(element => {
    element.addEventListener("click", (event) => {
        if (!event.target) return;

        if ((event.target as HTMLInputElement).closest(".theme")) {
            currentTheme = element.id;
        } else if ((event.target as HTMLInputElement).closest(".font")) {
            currentFont = element.id;
        }
        document.querySelectorAll('input[type="button"]').forEach(e => {
            (e as HTMLElement).classList.remove("!brightness-50");
        });
        (element as HTMLElement).classList.add("!brightness-50");
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

const getAI = (): boolean | Ai => {
    let cloude_api = aiInputs.cloud_ai.apiInput.value;
    let cloude_model = aiInputs.cloud_ai.modelInput.value;
    let cloude_service = aiInputs.cloud_ai.serviceInput.value;
    let cloude_temperature = aiInputs.cloud_ai.temperatureInput.value;

    let local_source = aiInputs.local_ai.sourceInput.value;
    let local_model = aiInputs.local_ai.modelInput.value;
    let local_temperature = aiInputs.local_ai.temperatureInput.value;

    const isLocalMissing = !local_model || !local_source || !local_temperature;
    const isCloudeMissing = !cloude_api || !cloude_model || !cloude_service || !cloude_temperature;
    if (isCloudeMissing && isLocalMissing) return false;

    const determined_mode = isCloudeMissing ? "local_ai" : "cloud_ai";

    const aiObject: Ai = {
        "active_mode": "cloud_ai",
        "local_ai": {
            "source": local_source || "",
            "model": local_model || "",
            "temperature": Number(local_temperature) || 0.0,
        },
        "cloud_ai": {
            "api": cloude_api || "",
            "model": cloude_model || "",
            "service": cloude_service || "",
            "temperature": Number(cloude_temperature) || 0.0,
        }
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
            if (aiObject === false) {
                return false;
            }
            if (aiObject instanceof Object) {
                userSettings.ai.cloud_ai.api = aiObject.cloud_ai.api;
                userSettings.ai.cloud_ai.model = aiObject.cloud_ai.model;
                userSettings.ai.cloud_ai.service = aiObject.cloud_ai.service;
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
        errorBox.classList.add("inline");
        errorBox.classList.remove("hidden");
    } else if (status === false) {
        errorBox.classList.add("hidden");
        errorBox.classList.remove("inline");
    }
}

buttons.forEach(button => {
    button?.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        if (!target) return;
        const bodyQ = target?.closest(".body-q");
        if (!bodyQ) return;

        const bodyQNumber = bodyQ.getAttribute("data-q") || "";
        if (!bodyQNumber) return;
        const bodyQNextNumber = (Number(bodyQ.getAttribute("data-q")) + 1).toString();
        const pass = getSubmits(bodyQNumber, bodyQNextNumber);
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

document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const target = event.target as HTMLElement;
        if (!target) return;
        const bodyQ = target?.closest(".body-q");
        if (!bodyQ) return;

        const bodyQNumber = bodyQ.getAttribute("data-q") || "";
        if (!bodyQNumber) return;
        const bodyQNextNumber = (Number(bodyQ.getAttribute("data-q")) + 1).toString();
        const pass = getSubmits(bodyQNumber, bodyQNextNumber);
        if (pass === false) {
            sendError("Missing required fields. Please fill out all inputs.");
            return;
        };
        sendError("", false);

        bodyQ.removeAttribute("active");
        progress.value += 20;
        const newBodyQ = document.querySelector(`.q${bodyQNextNumber}`);
        newBodyQ?.setAttribute("active", "");
    }
})

document.getElementById("submit")?.addEventListener("click", async () => {
    if (!userSettings.alias || !userSettings.font || !userSettings.theme) return;
    userSettings.onboarding_complete = true;
    const response = await invoke("send_user_data", { data: JSON.stringify(userSettings) });
    if (response === true) {
        await window.close();
    } else {
        alert("unknow error, please restart the your program")
    }
});

document.querySelectorAll(".terux_temperature_inputs").forEach(element => {
    element.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        target.value = Number(target.value).toFixed(1);
    });
});


document.querySelectorAll('input[type="button"]').forEach(element => {
    element.addEventListener("click", () => {
        updateAiInputPresets(element.id);
    });
});