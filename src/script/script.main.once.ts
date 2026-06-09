import { addNewTab } from "./script.main.tab";
import { initData } from "./script.main.utils";

export const initOnce = async (): Promise<void> => {
    addNewTab();
    
    await initData();
}