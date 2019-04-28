import { JSDOM } from 'jsdom';
import { Controller } from "/src/contentScripts/controller.js";
import { ChromeAPI } from "./mocks.js";
import { Messages } from "/src/constants.js";


// -------------------------------------------- Setup and teardown ----------------------------------------------

beforeAll(function () {
    Object.defineProperty(window.HTMLElement.prototype, 'innerText', {
        get: function () {
            return this.textContent.replace(/\s\s/g, '').trim()
        },
    });
    Object.defineProperty(window.HTMLElement.prototype, 'offsetWidth', {
        get: function () {
            return this._customOffsetWidth !== undefined ? this._customOffsetWidth : 123;
        }
    });
    Object.defineProperty(window.HTMLElement.prototype, 'offsetHeight', {
        get: function () {
            return this._customOffsetHeight !== undefined ? this._customOffsetHeight : 123;
        }
    });

    const fs = require('fs');
    const readTableContents = (url, resolve) => fs.readFile(
        url.split('file://')[1],
        (err, data) => {
            if (err) throw err;
            resolve(data.toString());
        }
    );

    chromeAPI = new ChromeAPI();
    global.chrome = chromeAPI.get();
    global.fetch = url => new Promise(resolve => resolve({
        text: () => new Promise(resolve => {
            readTableContents(url, resolve);
        })
    }));
});

let controller;
let chromeAPI;

beforeEach(async function () {
    const dom = await JSDOM.fromFile('/home/jakub/BP/code/chrome-extension/tests/testingPage.html', {
        resources: 'usable'
    });
    document.body.innerHTML = dom.window.document.body.innerHTML;

    // In order to get the main panel iframe properly loaded, we need to access `window.document`
    // from JSDOM instead of regular `window.document`
    delete global.window.document;
    global.window.document = dom.window.document;

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

    controller = new Controller();
    await controller.init(false, false, false);
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('insert all parts inside a page after clicking on browser icon', done => {
    chromeAPI.messageHandler({
        msg: Messages.BROWSER_ACTION_CLICKED
    }, null, null);

    const panelIframe = controller._mainPanelController.iframe;
    const domNavigation = controller._selectEngine._domNavigation._controls.node;
    const previewTable = controller._previewTable._modal;
    expect(controller._mainPanelController.isVisible).toBe(true);
    expect(controller._mainPanelController.isInjected).toBe(true);
    expect(document.querySelector('.scraping-iframe-panel')).toBe(panelIframe);
    expect(document.querySelector('.scraping-dom-navigation')).toBe(domNavigation);
    expect(document.querySelector('.scraping-modal')).toBe(previewTable);

    const panelDocument = panelIframe.contentWindow.window.document;
    panelDocument.onload = () => {
        expect(panelDocument.querySelector('#control-panel-content')).not.toBe(null);
        done();
    };
});

test('insert all parts inside a page after a reload', done => {
    chromeAPI.messageHandler({
        msg: Messages.TAB_UPDATED,
        shouldBeVisible: true
    }, null, null);

    const panelIframe = controller._mainPanelController.iframe;
    const domNavigation = controller._selectEngine._domNavigation._controls.node;
    const previewTable = controller._previewTable._modal;
    expect(controller._mainPanelController.isVisible).toBe(true);
    expect(controller._mainPanelController.isInjected).toBe(true);
    expect(document.querySelector('.scraping-iframe-panel')).toBe(panelIframe);
    expect(document.querySelector('.scraping-dom-navigation')).toBe(domNavigation);
    expect(document.querySelector('.scraping-modal')).toBe(previewTable);

    const panelDocument = panelIframe.contentWindow.window.document;
    panelDocument.onload = () => {
        expect(panelDocument.querySelector('#control-panel-content')).not.toBe(null);
        done();
    };
});

test('insert all parts inside a page after a reload (before the message handler is set)', async () => {
    controller = new Controller();
    await controller.init(true, false, false);

    const panelIframe = controller._mainPanelController.iframe;
    const domNavigation = controller._selectEngine._domNavigation._controls.node;
    const previewTable = controller._previewTable._modal;
    expect(controller._mainPanelController.isVisible).toBe(true);
    expect(controller._mainPanelController.isInjected).toBe(true);
    expect(document.querySelector('.scraping-iframe-panel')).toBe(panelIframe);
    expect(document.querySelector('.scraping-dom-navigation')).toBe(domNavigation);
    expect(document.querySelector('.scraping-modal')).toBe(previewTable);

    const panelDocument = panelIframe.contentWindow.window.document;
    panelDocument.onload = () => {
        expect(panelDocument.querySelector('#control-panel-content')).not.toBe(null);
        done();
    };
});

test('ensure the control panel is in correct state after injecting', done => {
    chromeAPI.messageHandler({
        msg: Messages.TAB_UPDATED,
        shouldBeVisible: true,
        minimized: true,
        onLeft: true
    }, null, null);

    const panelIframe = controller._mainPanelController.iframe;
    const panelDocument = panelIframe.contentWindow.window.document;
    panelDocument.onload = () => {
        const controlPanel = document.querySelector('.scraping-iframe-panel');
        expect(controlPanel.classList.contains('scraping-minimized')).toBe(true);
        expect(controlPanel.classList.contains('scraping-left')).toBe(true);
        done();
    };
});

test('ensure the control panel is in correct state after injecting (before the message handler is set)', async done => {
    controller = new Controller();
    await controller.init(true, true, true);

    const panelIframe = controller._mainPanelController.iframe;
    const panelDocument = panelIframe.contentWindow.window.document;
    panelDocument.onload = () => {
        const controlPanel = document.querySelector('.scraping-iframe-panel');
        expect(controlPanel.classList.contains('scraping-minimized')).toBe(true);
        expect(controlPanel.classList.contains('scraping-left')).toBe(true);
        done();
    };
});

test('', () => {

});

test('', () => {

});

test('', () => {

});

test('', () => {

});
