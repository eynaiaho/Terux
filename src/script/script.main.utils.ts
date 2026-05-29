export const addListener = (event: string, element: string | HTMLElement, handle: (ev: Event) => void, selectAll: boolean = false) => {
    if(element instanceof HTMLElement) {
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