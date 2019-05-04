import { JSDOM } from "jsdom";
import { ChromeAPI } from "./mocks.js";


export function defineHTMLProperties(targetWindow = window) {
    // Mocking the `offsetWidth`,  `offsetHeight` and `innerText`
    Object.defineProperty(targetWindow.HTMLElement.prototype, 'offsetWidth', {
        get: function () {
            return this._customOffsetWidth !== undefined ? this._customOffsetWidth : 123;
        }
    });
    Object.defineProperty(targetWindow.HTMLElement.prototype, 'offsetHeight', {
        get: function () {
            return this._customOffsetHeight !== undefined ? this._customOffsetHeight : 123;
        }
    });
    if (!targetWindow.HTMLElement.prototype.hasOwnProperty('innerText')) {
        Object.defineProperty(targetWindow.HTMLElement.prototype, 'innerText', {
            get: function () {
                return this.textContent.replace(/\s\s/g, '').trim()
            },
            set: function (value) {
                this.textContent = value;
            }
        });
    }
}


export async function prepareTestPage() {
    const path = require('path');
    const fs = require('fs');

    const testingPage = path.resolve(__dirname, './testingPage.html');
    const dom = await JSDOM.fromFile(testingPage, {
        url: 'http://localhost',
        resources: 'usable',
        runScripts: 'dangerously'
    });
    document.body.innerHTML = dom.window.document.body.innerHTML;


    const readFileContents = url => fs
        .readFileSync(url.split('file://')[1])
        .toString();
    global.chrome = ChromeAPI.mock();
    global.fetch = url => new Promise(resolve => resolve({
        text: () => new Promise(resolve => {
            resolve(readFileContents(url));
        })
    }));

    // Need to set non-inline CSS via JS
    let style = document.createElement('style');
    style.innerHTML =
        '.display-none-class{ display: none; }' +
        '.opacity-zero-class{ opacity: 0; }';
    document.head.appendChild(style);

    // JSDOM does no rendering, so offsetWidth/offsetHeight have to be set via JS
    const hidden2 = document.querySelector('#hidden-div-2');
    hidden2._customOffsetWidth = 0;
    hidden2._customOffsetHeight = 0;

    return dom;
}
