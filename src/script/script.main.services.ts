import { tabs } from "./script.main.tab";

export const findTabIndex = (id: number): number => {
    const index = tabs.findIndex(i => i.tab === id);
    return index;
}