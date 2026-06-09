const TAB_CLOSE_ICON_SVG = `
    <svg width="15" height="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
`;

const TAB_ADD_ICON_SVG = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19M5 12H19" stroke="currentColor" style="color: var(--text);" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round" />
    </svg>
`;

const HIDE_ICON_SVG = `
    <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <line x1="4" y1="12" x2="20" y2="12"></line>
    </svg>
`;

const SCREEN_ICON_SVG = `
    <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect width="16" height="16" x="4" y="4" rx="1.5"></rect>
    </svg>
`;

const CLOSE_ICON_SVG = `
    <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 6 6 18"></path>
        <path d="m6 6 12 12"></path>
    </svg>
`;

const MENU_AI_ICON_SVG = `
    <svg xmlns="http://w3.org" width="24" height="24" viewBox="0 0 24 24" fill="var(--accent)">
        <path d="M13 10h7l-9 13v-9H4l9-13z" />
    </svg>
`;

const MENU_SETTINGS_ICON_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        fill="var(--accent)">
        <path
        d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.39-.29-.61-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.26-.25-.45-.5-.45h-3.76c-.25 0-.46.19-.5.45l-.36 2.54c-.59.24-1.12.57-1.62.94l-2.39-.96c-.22-.08-.49 0-.61.22L2.73 8.87c-.11.2-.06.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.39.29.61.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.26.25.45.5.45h3.76c.25 0 .46-.19.5-.45l.36-2.54c.59-.24 1.12-.57 1.62-.94l2.39.96c.22.08.49 0 .61-.22l1.92-3.32c.11-.2.06-.47-.12-.61l-2.03-1.58zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
    </svg>
`;

interface DivMenu {
    terminal: HTMLDivElement,
    settings: HTMLDivElement,
    footer: HTMLDivElement
}
const divMenu: DivMenu = {
    terminal: document.querySelector(".body")!,
    settings: document.querySelector(".settings")!,
    footer: document.querySelector(".footer")!
}

interface AIDivMenu {
    div: HTMLDivElement,
    center_div: HTMLDivElement,
    input: HTMLInputElement,
    button: HTMLButtonElement,
    smart_button: HTMLButtonElement
}
const aiDivMenu: AIDivMenu = {
    div: document.querySelector(".ai-div")!,
    center_div: document.querySelector(".ai-center-div")!,
    input: document.querySelector("#aiDataInput")!,
    button: document.querySelector("#aiDataButton")!,
    smart_button: document.querySelector("#smartButton")!,
}

interface DivSettingsMenu {
    buttons: {
        users_button: HTMLDivElement,
        ai_button: HTMLDivElement,
        users_datas: {
            user_alias_data: HTMLInputElement,
            user_theme_datas: {
                tn: HTMLButtonElement,
                n: HTMLButtonElement,
                g: HTMLButtonElement,
                sl: HTMLButtonElement,
            },
            user_font_datas: {
                jbm: HTMLButtonElement,
                fc: HTMLButtonElement,
                cc: HTMLButtonElement,
            },
            user_telemetry_status_data: HTMLInputElement
        },
        ai_datas: {
            ai_api_data: HTMLInputElement,
            ai_model_data: HTMLInputElement,
            ai_service_data: HTMLInputElement
        },
        save_button: HTMLButtonElement
    },
    divs: {
        users_div: HTMLDivElement,
        ai_div: HTMLDivElement
    },
}
const divSettingsMenu: DivSettingsMenu = {
    buttons: {
        users_button: document.querySelector("#settingsUser")!,
        ai_button: document.querySelector("#settingsAI")!,
        users_datas: {
            user_alias_data: document.querySelector("#userAliasInput")!,
            user_theme_datas: {
                tn: document.querySelector("#tn")!,
                n: document.querySelector("#n")!,
                g: document.querySelector("#g")!,
                sl: document.querySelector("#sl")!,
            },
            user_font_datas: {
                jbm: document.querySelector("#jbm")!,
                fc: document.querySelector("#fc")!,
                cc: document.querySelector("#cc")!,
            },
            user_telemetry_status_data: document.querySelector("#telemetryCheckbox")!
        },
        ai_datas: {
            ai_api_data: document.querySelector("#aiApiInput")!,
            ai_model_data: document.querySelector("#aiModelInput")!,
            ai_service_data: document.querySelector("#aiServiceInput")!
        },
        save_button: document.querySelector("#settingsSubmit")!
    },
    divs: {
        users_div: document.querySelector(".settings-content-users")!,
        ai_div: document.querySelector(".settings-content-ai")!
    }
}

export {TAB_ADD_ICON_SVG, TAB_CLOSE_ICON_SVG, MENU_AI_ICON_SVG, MENU_SETTINGS_ICON_SVG, CLOSE_ICON_SVG, HIDE_ICON_SVG, SCREEN_ICON_SVG, divMenu, divSettingsMenu, aiDivMenu};