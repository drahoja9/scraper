import { Controller } from "/src/contentScripts/controller.js";
import { Messages } from "/src/constants.js";
import { ChromeAPI } from "./mocks.js";
import { JSDOM } from 'jsdom';
import { _click, _mouseover } from "../utils";
import { MAIN_PANEL_PAGE } from "/src/constants";


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
    const readFileContents = (url, resolve) => fs.readFile(
        url.split('file://')[1],
        (err, data) => {
            if (err) throw err;
            resolve(data.toString());
        }
    );

    global.chrome = ChromeAPI.mock();
    global.fetch = url => new Promise(resolve => resolve({
        text: () => new Promise(resolve => {
            readFileContents(url, resolve);
        })
    }));
});

let controller;
let panelDocument;
let mainPanelInit;

async function testIframe(doc) {
    return new Promise(resolve => {
        const iframe = doc.createElement('iframe');
        iframe.setAttribute('src', chrome.runtime.getURL(MAIN_PANEL_PAGE));
        doc.body.appendChild(iframe);
        iframe.onload = () => {
            console.log('IFRAME LOADED!');
            iframe.contentWindow.addEventListener('message', () => {
                console.log('YAAY');
            });
            resolve(iframe);
        };
    });
}

beforeEach(async function () {
    const path = require('path');
    const testingPage = path.resolve(__dirname, '../testingPage.html');

    const dom = await JSDOM.fromFile(testingPage, {
        resources: 'usable',
        runScripts: 'dangerously'
    });
    document.body.innerHTML = dom.window.document.body.innerHTML;

    // const iframe = await testIframe(dom.window.document);

    // const tmp = window.document;
    // delete global.window.document;
    // global.window.document = dom.window.document;

    // delete global.window.document;
    // global.window.document = tmp;

    // In order to get the main panel iframe properly loaded, we need to access `window.document`
    // from JSDOM instead of regular `window.document`
    delete global.window.document;
    global.window.document = dom.window.document;
    global.window.MouseEvent = dom.window.MouseEvent;

    const test = document.querySelector('#container');
    console.log(getComputedStyle(test));

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

function onMainPanelDOMLoad(testCallback, done) {
    const fs = require('fs');
    const path = require('path');
    const mainPanelScripts = [
        'utils.js', 'columnPool/columnName.js', 'columnPool/columnRemoveBtn.js', 'columnPool/columnNameForm.js',
        'columnPool/columnBtn.js', 'columnPool/columnPool.js', 'selectors.js', 'mainPanel.js'
    ];

    const constantsPath = path.resolve(__dirname, '../../src/constants.js');
    let code = fs.readFileSync(constantsPath, { encoding: 'utf-8' });
    code = code.replace(/export /g, '');
    let uglifiedCode = code;
    for (const script of mainPanelScripts) {
        const absPath = path.resolve(__dirname, '../../src/mainPanel/' + script);
        code = fs.readFileSync(absPath, { encoding: 'utf-8' });

        let importIdx = code.indexOf('import');
        while (importIdx !== -1) {
            const newlineIdx = code.indexOf('\n');
            code = code.substring(0, importIdx) + code.substring(newlineIdx + 1);
            importIdx = code.indexOf('import');
        }

        code = code.replace(/export /g, '');
        uglifiedCode += code;
    }

    const panelIframe = controller._mainPanelController.iframe;
    panelDocument = panelIframe.contentWindow.window.document;
    const scriptEl = panelDocument.createElement("script");
    scriptEl.textContent = uglifiedCode;

    panelDocument.addEventListener('load', () => {
        panelDocument.body.appendChild(scriptEl);
        mainPanelInit = panelIframe.contentWindow.window.init;

        panelIframe.contentWindow.window.parent.postMessage = jest.fn((message, targetOrigin) => {
            controller._communication._communicationWithMainPanel({
                data: message,
                origin: chrome.runtime.getURL(MAIN_PANEL_PAGE)
            });
        });

        testCallback();
        done();
    });
}

function onMainPanelLoad(testCallback, done) {
    const panelIframe = controller._mainPanelController.iframe;
    panelIframe.addEventListener('load', () => {
        testCallback();
        done();
    });
}

test('insert all parts inside a page after clicking on browser icon', done => {
    chrome.runtime.onMessage.listener({
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

    onMainPanelDOMLoad(() => {
        expect(panelDocument.querySelector('#control-panel-content')).not.toBe(null);
    }, done);
});

test('insert all parts inside a page after a reload', done => {
    chrome.runtime.onMessage.listener({
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

    onMainPanelDOMLoad(() => {
        expect(panelDocument.querySelector('#control-panel-content')).not.toBe(null);
    }, done);
});

test('insert all parts inside a page after a reload (before the message handler is set)', async done => {
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

    onMainPanelDOMLoad(() => {
        expect(panelDocument.querySelector('#control-panel-content')).not.toBe(null);
    }, done);
});

test('ensure the control panel is in correct state after injecting', done => {
    chrome.runtime.onMessage.listener({
        msg: Messages.TAB_UPDATED,
        shouldBeVisible: true,
        minimized: true,
        onLeft: true
    }, null, null);

    onMainPanelLoad(() => {
        const controlPanel = document.querySelector('.scraping-iframe-panel');
        expect(controlPanel.classList.contains('scraping-minimized')).toBe(true);
        expect(controlPanel.classList.contains('scraping-left')).toBe(true);
    }, done);
});

test('ensure the control panel is in correct state after injecting (before the message handler is set)', async done => {
    controller = new Controller();
    await controller.init(true, true, true);

    onMainPanelLoad(() => {
        const controlPanel = document.querySelector('.scraping-iframe-panel');
        expect(controlPanel.classList.contains('scraping-minimized')).toBe(true);
        expect(controlPanel.classList.contains('scraping-left')).toBe(true);
    }, done);
});

test('select an element', done => {
    chrome.runtime.onMessage.listener({
        msg: Messages.BROWSER_ACTION_CLICKED
    }, null, null);

    onMainPanelDOMLoad(() => {
        const basicsCard = panelDocument.querySelector('#select-basics');
        const minMaxBtn = panelDocument.querySelector('#min-max-btn');
        const selectSwitch = panelDocument.querySelector('#select-elements-checkbox');
        const hiddenDiv = document.querySelector('#hidden-div-1');
        const firstP = document.querySelector('#first-p');
        mainPanelInit();

        _click(basicsCard);
        _click(minMaxBtn);
        expect(basicsCard.classList.contains('collapsed')).toBe(false);
        expect(minMaxBtn.classList.contains('rotated')).toBe(true);

        // Start selecting elements -- activate MouseSelector
        _click(selectSwitch);

        _mouseover(hiddenDiv);
        hiddenDiv.click();
        console.log(hiddenDiv.className);
        // expect(hiddenDiv.classList.contains('scraping-highlighted-row')).toBe(false);

        _mouseover(firstP);
        // firstP.click();
        console.log(firstP.className);
        // expect(firstP.classList.contains('scraping-highlighted-row')).toBe(true);
    }, done);
});

test('', () => {

});

test('', () => {

});

test('', () => {

});
