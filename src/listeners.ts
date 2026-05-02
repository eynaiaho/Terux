import { addListener, findElement } from "./services";
import { addNewTab } from "./tab";

const addTabListener = addListener("click", "#addTab", () => {
    addNewTab();
});

addListener("wheel", ".body-tabs", (event) => {
    event.preventDefault();
    const element = findElement(".body-tabs");
    if(!element) return;
    element.scrollLeft += (event as WheelEvent).deltaY;
})