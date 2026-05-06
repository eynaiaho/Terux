import { invoke } from "@tauri-apps/api/core";
import { Window } from "@tauri-apps/api/window";

const progress = document.getElementById("progressBar") as HTMLInputElement;

const buttons = [
    document.getElementById("q1"),
    document.getElementById("q2"),
    document.getElementById("q3"),
    document.getElementById("q4"),
    document.getElementById("q5")
];

const userSettings = {
    "alias": "",
    "theme": "",
    "font": "",
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
            const telemetry = getTelemetry();
            userSettings.telemetry = telemetry;
            return true;
    }

    return false;
}

document.getElementById("exit")?.addEventListener("click", async () => {
    await window.close();
})

buttons.forEach(button => {
    button?.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        console.log(target);
        if (!target) return;
        const bodyQ = target?.closest(".body-q");
        if (!bodyQ) return;
        console.log(bodyQ);


        bodyQ.removeAttribute("active");
        const bodyQNumber = bodyQ.getAttribute("data-q") || "";
        if (!bodyQNumber) return;
        const bodyQNextNumber = (Number(bodyQ.getAttribute("data-q")) + 1).toString();
        const pass = getSubmits(bodyQNumber, bodyQNextNumber);
        if (!pass) return;
        progress.value += 20;
        const newBodyQ = document.querySelector(`.q${bodyQNextNumber}`);
        console.log(newBodyQ)
        newBodyQ?.setAttribute("active", "");
    })
})

document.getElementById("submit")?.addEventListener("click", async () => {
    if (!userSettings.alias || !userSettings.font || !userSettings.theme) return;
    userSettings.onboarding_complete = true;
    const response = await invoke("send_user_data", { data: JSON.stringify(userSettings) });
    if(response === true) {
        await window.close();
    } else {
        alert("unknow error, please restart the your program")   
    }
})