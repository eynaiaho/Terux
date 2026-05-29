import { addListener, findElement } from "./script.main.utils";
import { addNewTab } from "./script.main.tab";

const addTabListener = addListener("click", "#addTab", () => {
    addNewTab();
});

addListener("wheel", ".body-tabs", (event) => {
    event.preventDefault();
    const element = findElement(".body-tabs");
    if (!element) return;
    element.scrollLeft += (event as WheelEvent).deltaY;
})