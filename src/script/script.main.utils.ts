import { invoke } from "@tauri-apps/api/core";

import { divSettingsMenu, aiDivMenu } from "./script.main.assets";
import { setGlobalUserConfig, setSmartStatus, GLOBAL_USER_CONFIG, SMART_STATUS } from "./script.main.config";
import { Terminal } from "@xterm/xterm";

export const addListener = (event: string, element: string | HTMLElement, handle: (ev: Event) => void, selectAll: boolean = false) => {
    if (element instanceof HTMLElement) {
        element.addEventListener(event, handle);
        return;
    }
    if (selectAll) {
        document.querySelectorAll(element as string)?.forEach(target => target.addEventListener(event, handle));
        return;
    }
    const target = (/[\.\#\[\]]/g).test(element as string) ? document.querySelector(element as string) : document.getElementById(element as string) || null;
    if (!target) {
        return console.error(`selected "${element}" element is not found in dom. [event: ${event}]`)
    } else {
        target.addEventListener(event, handle);
    }
}

export const findElement = (element: string): Element | null => {
    const target = (/[\.\#\[\]]/g).test(element) ? document.querySelector(element) : document.getElementById(element) || null;
    if (!target) {
        console.error(`selected "${element}" element is not found in dom.`)
        return null;
    }
    return target;
}

export const findElementAll = (element: string): NodeListOf<Element> => {
    const elements = document.querySelectorAll(element);
    return elements;
}

export const declarePanic = async (message: string = "", question: boolean = false, critic: boolean = false) => {
    critic ? await window.close() : {};
    if (question) {
        const answer: boolean = confirm(message);
        if (answer) {
            await window.close();
        } else {
            return;
        }
        return;
    }
    alert(message);
}

export const changeMenu = (menu: HTMLElement, div: Object) => {
    Object.values(div).forEach(element => {
        const hasActive = element?.hasAttribute("active");
        if (hasActive) element?.removeAttribute("active");
    });
    menu.setAttribute("active", "");
}

export const changeAIMenu = (status: boolean) => {
    if (status === true) {
        aiDivMenu.div.style.display = "flex";
    } else {
        aiDivMenu.div.style.display = "none";
        aiDivMenu.input.value = "";
    }
}

export const smartMode = (status: boolean) => {
    setSmartStatus(status);
    if (SMART_STATUS && aiDivMenu.smart_button) {
        aiDivMenu.smart_button.style.filter = "brightness(1.4)";
        changeAIMenu(true);
    } else if (aiDivMenu.smart_button) {
        aiDivMenu.smart_button.style.filter = "brightness(1)";
        changeAIMenu(false);
    }
}

export const sendToAI = async (term: Terminal, data: string) => {
    if (!data) return;
    smartMode(false);
    try {
        await invoke("inject_str", { data: "\x1b" });
        await new Promise(r => setTimeout(r, 100));
        term.write("\x1b[33m[AI Thinking...]\x1b[0m");
        const response = await invoke("ask_ai", { data: data });

        term.write(`\x1b[16D\x1b[K`);

        await invoke("inject_str", { data: `${response}` });
    } catch (error) {
        console.error(error);
        term.write(`\x1b[17D\x1b[K\x1b[31m[AI Error | Restart the Terminal]\x1b[0m\r\n`);
    }
}

export const getUserConfig = async () => {
    const string_json: string = await invoke("get_user_config");
    return JSON.parse(string_json);
}

export const changeBackground = (theme: string) => {
    const htmlElement = document.querySelector("html");
    htmlElement?.setAttribute("color-theme", theme);
}

export const loadSettings = (userConfig: any) => {
    const userDatas = divSettingsMenu.buttons.users_datas;
    const aiDatas = divSettingsMenu.buttons.ai_datas;

    const currentAlias = userConfig.alias;
    const currentTheme = userConfig.theme;
    const currentFont = userConfig.font;
    const currentTelemetry = userConfig.telemetry;

    userDatas.user_alias_data.value = currentAlias;
    userDatas.user_theme_datas[currentTheme as keyof typeof userDatas.user_theme_datas].setAttribute("active-currently", "");
    userDatas.user_font_datas[currentFont as keyof typeof userDatas.user_font_datas].setAttribute("active-currently", "");
    userDatas.user_telemetry_status_data.checked = currentTelemetry as boolean;

    const currentApi = userConfig.ai.api;
    const currentModel = userConfig.ai.model;
    const currentService = userConfig.ai.service;

    aiDatas.ai_api_data.value = currentApi;
    aiDatas.ai_model_data.value = currentModel;
    aiDatas.ai_service_data.value = currentService;
}

export const saveSettings = async (object: any) => {
    await invoke("save_user_config", { data: JSON.stringify(object) });
}

export const settingsToObject = () => {
    const userDatas = divSettingsMenu.buttons.users_datas;
    const aiDatas = divSettingsMenu.buttons.ai_datas;
    const object = {
        alias: userDatas.user_alias_data.value,
        theme: findElement(".settings-theme-button[active-currently]")?.id,
        font: findElement(".settings-font-button[active-currently]")?.id,
        ai: {
            api: aiDatas.ai_api_data.value,
            model: aiDatas.ai_model_data.value,
            service: aiDatas.ai_service_data.value,
        },
        telemetry: userDatas.user_telemetry_status_data.checked as boolean,
        onboarding_complete: true
    }
    return object
}

export const toggleHideShow = () => {
    let should_show: boolean = false;
    let element = findElement("#toggleHideAPI") as HTMLButtonElement;
    if(!element) console.error("Cannot find toggleHideAPI");

    return function () {
        should_show = !should_show;
        if(should_show === true) {
            divSettingsMenu.buttons.ai_datas.ai_api_data.type = "text";
            element.textContent = "=";
            element.style.opacity = "0.5";
        } else {
            divSettingsMenu.buttons.ai_datas.ai_api_data.type = "password";
            element.textContent = "?";
            element.style.opacity = "1";
        }
    }
}

export const initData = async () => {
    const userConfig = await getUserConfig();
    changeBackground(userConfig.theme);
    setGlobalUserConfig(userConfig);

    loadSettings(userConfig);
}

export const getCSSVar = (varName: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

export const terminalConfig = (): Object => {
    const myTheme = {
        background: getCSSVar("--background-darker"),
        foreground: getCSSVar("--text"),
        cursor: getCSSVar("--accent"),
        selectionBackground: getCSSVar("--background-lighter"),
        red: getCSSVar("--error"),
        green: getCSSVar("--success")
    }

    const terminalConfigObject = {
        cursorBlink: true,
        cursorWidth: 5,

        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 14,
        fontWeight: 'normal',

        convertEol: true,
        allowProposedApi: true,

        theme: myTheme
    }

    switch (GLOBAL_USER_CONFIG.font) {
        case "jbm":
            terminalConfigObject.fontFamily = '"JetBrains Mono", monospace';
            break;
        case "fc":
            terminalConfigObject.fontFamily = '"Fira Code", monospace';
            break;
        case "cc":
            terminalConfigObject.fontFamily = '"Cascadia Code", monospace';
            break;
    }

    if (document.querySelector("html")?.getAttribute("color-theme") === "" || document.querySelector("html")?.getAttribute("color-theme") === null) {
        document.querySelector("html")?.setAttribute("color-theme", GLOBAL_USER_CONFIG.theme);
    }

    return terminalConfigObject;
}