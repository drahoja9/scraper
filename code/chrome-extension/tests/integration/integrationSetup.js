import { defineHTMLProperties, prepareTestPage } from "../setup.js";


export async function DOMWindowSetup() {
    const dom = await prepareTestPage();

    global.window.document.createElement = tagName => {
        return dom.window.document.createElement(tagName);
    };
    global.window.document.body.appendChild = node => {
        return dom.window.document.body.appendChild(node);
    };
    global.window.document.head.appendChild = node => {
        return dom.window.document.head.appendChild(node);
    };
    global.window.addEventListener = (type, listener, options) => {
        return dom.window.addEventListener(type, listener, options);
    };
    global.window.removeEventListener = (type, listener, options) => {
        return dom.window.removeEventListener(type, listener, options);
    };
    global.window.document.addEventListener = (type, listener, options) => {
        return dom.window.document.addEventListener(type, listener, options);
    };
    global.window.document.removeEventListener = (type, listener, options) => {
        return dom.window.document.removeEventListener(type, listener, options);
    };
    global.window.MouseEvent = dom.window.MouseEvent;
    global.window.FocusEvent = dom.window.FocusEvent;
    global.window.KeyboardEvent = dom.window.KeyboardEvent;
    global.window.document.querySelector = selector => {
        return dom.window.document.querySelector(selector);
    };
    global.window.document.querySelectorAll = selector => {
        return dom.window.document.querySelectorAll(selector);
    };
    global.window.getComputedStyle = node => {
        return dom.window.getComputedStyle(node);
    };
    defineHTMLProperties(dom.window);
}
