import { Controller } from "/src/contentScripts/controller.js";
import { Messages } from "/src/constants.js";
import { _click, _mouseover, insertMainPanelScripts } from "../utils.js";
import { defineHTMLProperties, prepareTestPage } from "../setup.js";


// -------------------------------------------- Setup and teardown ----------------------------------------------

let controller;
let panelDocument;
let mainPanelInit;

beforeEach(async function () {
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

    controller = new Controller();
    await controller.init(false, false, false);
});

// -------------------------------------------------- Tests -----------------------------------------------------

function onContentScriptLoad(testCallback) {
    // return new Promise(resolve => {
    controller._communication._mainPanelHandler = event => {
        controller._communication._mainPanelHandler(event);
        testCallback();
    };
    // });
}

function loadMainPanel() {
    return new Promise(resolve => {
        const panelIframe = controller._mainPanelController.iframe;
        panelDocument = panelIframe.contentWindow.window.document;

        panelIframe.addEventListener('load', () => {
            insertMainPanelScripts(panelDocument);
            mainPanelInit = panelIframe.contentWindow.window.init;
            resolve();
        });
    });
}


test('insert all parts inside a page after clicking on browser icon', async () => {
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

    await loadMainPanel();
    expect(panelDocument.querySelector('#control-panel-content')).not.toBe(null);
});

test('insert all parts inside a page after a reload', async () => {
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

    await loadMainPanel();
    expect(panelDocument.querySelector('#control-panel-content')).not.toBe(null);
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

    await loadMainPanel();
    expect(panelDocument.querySelector('#control-panel-content')).not.toBe(null);
});

test('ensure the control panel is in correct state after injecting', async () => {
    chrome.runtime.onMessage.listener({
        msg: Messages.TAB_UPDATED,
        shouldBeVisible: true,
        minimized: true,
        onLeft: true
    }, null, null);

    await loadMainPanel();
    const controlPanel = document.querySelector('.scraping-iframe-panel');
    expect(controlPanel.classList.contains('scraping-minimized')).toBe(true);
    expect(controlPanel.classList.contains('scraping-left')).toBe(true);
});

test('ensure the control panel is in correct state after injecting (before the message handler is set)', async () => {
    controller = new Controller();
    await controller.init(true, true, true);

    await loadMainPanel();
    const controlPanel = document.querySelector('.scraping-iframe-panel');
    expect(controlPanel.classList.contains('scraping-minimized')).toBe(true);
    expect(controlPanel.classList.contains('scraping-left')).toBe(true);
});

test('select an element', async done => {
    // controller._communication._mainPanelHandler = event => {
    //     controller._communication._mainPanelHandler(event);
    //
    //     console.log(hiddenDiv.className);
    //     // expect(hiddenDiv.classList.contains('scraping-highlighted-row')).toBe(false);
    //
    //     // _mouseover(firstP);
    //     // _click(firstP);
    //     // console.log(firstP.className);
    //     // expect(firstP.classList.contains('scraping-highlighted-row')).toBe(true);
    //     done();
    // };

    chrome.runtime.onMessage.listener({
        msg: Messages.BROWSER_ACTION_CLICKED
    }, null, null);

    await loadMainPanel();

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

    const wait = () => new Promise(resolve => {
        setTimeout(resolve, 200)
    });
    await wait();

    _mouseover(hiddenDiv);
    _click(hiddenDiv);
    console.log(hiddenDiv.className);

    _mouseover(firstP);
    _click(firstP);
    console.log(firstP.className);

    done();
});

test('', () => {

});

test('', () => {

});

test('', () => {

});
