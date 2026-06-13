import { addListener, findElement, changeMenu, settingsToObject, loadSettings, saveSettings, smartMode, sendToAI, toggleHideShow } from "./script.main.utils";
import { addNewTab } from "./script.main.tab";
import { aiDivMenu, divMenu, divSettingsMenu } from "./script.main.assets";
import { GLOBAL_USER_CONFIG } from "./script.main.config";
import { term } from "./script.main.terminal";

const addTabListener = addListener("click", "#addTab", () => {
    addNewTab();
});

const toggleAPIVisible = toggleHideShow();

/*
window.addEventListener('keydown', (e) => {
    const blockedFunctionKeys = ['F1', 'F3', 'F5', 'F6', 'F7', 'F10', 'F11', 'F12'];
    const blockedCtrlLetters = [
        'r', 'R',
        'f', 'F',
        'p', 'P',
        't', 'T',
        'n', 'N',
        'w', 'W',
        's', 'S',
        'g', 'G',
        'o', 'O' 
    ];

    if (blockedFunctionKeys.includes(e.key)) {
        e.preventDefault();
        return;
    }

    if (e.ctrlKey && blockedCtrlLetters.includes(e.key)) {
        e.preventDefault();
        return;
    }

    if (e.ctrlKey && e.shiftKey && (e.key === 'r' || e.key === 'R' || e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        return;
    }
});
*/

addListener("wheel", ".body-tabs", (event) => {
    event.preventDefault();
    const element = findElement(".body-tabs");
    if (!element) return;
    element.scrollLeft += (event as WheelEvent).deltaY;
});

// AI Mode

addListener("click", ".ai-div", (event) => {
    if(event.target === event.currentTarget) {
        smartMode(false);
    }
});

addListener("click", "#smartButton", (event) => {
    smartMode(true);
});

addListener("click", "#aiDataButton", (event) => {
    const data = aiDivMenu.input.value;
    if (!data) return;
    sendToAI(term, data);
});

addListener("keydown", "#aiDataInput", (event) => {
    if ((event as KeyboardEvent).key === "Enter") {
        const data = aiDivMenu.input.value;
        if (!data) return;
        sendToAI(term, data);
    }
});

// Menu

addListener("click", "#settingsButton", (event) => { // OPEN SETTINGS
    changeMenu(divMenu.settings, divMenu);
});

addListener("click", "#exitSettings", (event) => { // CLOSE SETTINGS
    changeMenu(divMenu.terminal, divMenu);
    loadSettings(GLOBAL_USER_CONFIG);
});

// Settings

addListener("click", "#settingsUser", (event) => { // OPEN USERS SETTINGS
    changeMenu(divSettingsMenu.divs.users_div, divSettingsMenu.divs);
});

addListener("click", "#settingsAI", (event) => { // OPEN AI SETTINGS
    changeMenu(divSettingsMenu.divs.ai_div, divSettingsMenu.divs);
});

// Settings Save Button

addListener("click", "#settingsSubmit", async (event) => {
    if (!divSettingsMenu.buttons.save_button.hasAttribute("active")) return;
    const data = settingsToObject();
    if (JSON.stringify(data) === JSON.stringify(GLOBAL_USER_CONFIG)) {
        divSettingsMenu.buttons.save_button.removeAttribute("active");
        return;
    };
    await saveSettings(data);
    window.location.reload();
});

addListener("click", ".settings-font-button", (event) => {
    const targetButton = event.target as HTMLButtonElement;
    const activeElement = findElement(".settings-font-button[active-currently]");
    if (activeElement) {
        activeElement.removeAttribute("active-currently");
    }
    targetButton.setAttribute("active-currently", "");
    divSettingsMenu.buttons.save_button.setAttribute("active", "");
}, true);

addListener("click", ".settings-theme-button", (event) => {
    const targetButton = event.target as HTMLButtonElement;
    const activeElement = findElement(".settings-theme-button[active-currently]");
    if (activeElement) {
        activeElement.removeAttribute("active-currently");
    }
    targetButton.setAttribute("active-currently", "");
    divSettingsMenu.buttons.save_button.setAttribute("active", "");
}, true);

addListener("change", ".settings-change", (event) => {
    divSettingsMenu.buttons.save_button.setAttribute("active", "");
}, true);

// Settings Toggle Hide
addListener("click", "#toggleHideAPI", (event) => {
    toggleAPIVisible();
});