import { findElement, addListener, findElementAll } from "./script.main.utils";
import { findTabIndex } from "./script.main.services";
import { TAB_CLOSE_ICON_SVG } from "./script.main.assets";

const tabsDOM = findElement("#bodyTabs");

let tabsIndex = 0;
let tabSelectedID: number | null = null;
export const tabs: { tab: number, element: HTMLDivElement }[] = [];

export const createTabDOM = (title: string, src: string) => {
    const tabID = Date.now();

    const bodyTab = document.createElement("div");
    bodyTab.className = "custom-tab"
    bodyTab.dataset.tabId = tabID.toString();

    const tabLogo = document.createElement("div");
    tabLogo.className = "w-[19px] h-auto object-contain custom-tab-logo";
    const tabLogoIMG = document.createElement("img");
    tabLogoIMG.height = 19;
    tabLogoIMG.alt = "ICON";
    tabLogoIMG.src = src;

    const tabTitle = document.createElement("div");
    tabTitle.className = "custom-tab-title";
    tabTitle.textContent = title;

    const tabClose = document.createElement("div");
    tabClose.className = "flex items-center my-0 mx-[5px]";
    tabClose.innerHTML = TAB_CLOSE_ICON_SVG;

    tabs.push({ "tab": tabID, "element": bodyTab });

    bodyTab.append(tabLogo, tabTitle, tabClose);
    tabLogo.appendChild(tabLogoIMG);
    if (tabsDOM) {
        tabsDOM.appendChild(bodyTab);
        console.log(tabs);
    }

    tabsIndex++;

    focusTab(tabID);

    bodyTab.scrollIntoView({ behavior: "smooth", inline: "end" });

    addListener("click", bodyTab, () => {
        tabSelectedID = tabID;
        focusTab(tabID);
    });
    addListener("click", tabClose, async () => {
        const selectedIndex = findTabIndex(tabID);
        if (selectedIndex !== -1) {
            tabs.splice(selectedIndex, 1);
            bodyTab?.remove();
            tabsIndex--;

            const targetElement = findElement("#bodyTabs");
            if (!targetElement || !targetElement.parentElement) return;
            const targetIndex = targetElement.children.length - 1;

            focusTab(tabs[targetIndex]?.tab as number);
        }
    })
}

export const changeTabDOM = (id: number, newTitle?: string, newSrc?: string) => {
    const selectedIndex = findTabIndex(id);
    if (selectedIndex === -1) return;
    const tabElement = tabs[selectedIndex]?.element;

    if (newTitle) {
        const tabElementTitle = tabElement?.querySelector(".custom-tab-title");
        if (tabElementTitle) {
            tabElementTitle.textContent = newTitle;
        }
    }
    if (newSrc) {
        const tabElementSrc = tabElement?.querySelector(".custom-tab-logo img") as HTMLImageElement;
        if (tabElementSrc) {
            tabElementSrc.src = newSrc;
        }
    }

}

export const focusTab = (id: number) => {
    const selectedIndex = findTabIndex(id);
    if (selectedIndex === -1) return;

    findElement(".custom-tab[active]")?.removeAttribute("active");

    findElement(`.custom-tab[data-tab-id="${id.toString()}"]`)?.setAttribute("active", "");
}

export const addNewTab = () => {
    createTabDOM("Terux Terminal", "../icons/terux.png");

}