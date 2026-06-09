export let GLOBAL_USER_CONFIG: any = null;
export let SMART_STATUS: boolean = false;

export const setGlobalUserConfig = (newConfig: any) => {
    GLOBAL_USER_CONFIG = newConfig;
}

export const setSmartStatus = (status: boolean) => {
    SMART_STATUS = status;
}