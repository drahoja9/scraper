import { Controller } from "/src/contentScripts/controller.js";
import { Messages } from "/src/constants.js";
import { DOMWindowSetup } from "./integrationSetup.js";
import { loadMainPanel } from "./integrationUtils.js";


// -------------------------------------------- Setup and teardown ----------------------------------------------

let controller;

beforeEach(async function () {
    await DOMWindowSetup();
    controller = new Controller();
    await controller.init(false, false, false);
});

// -------------------------------------------------- Tests -----------------------------------------------------

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

    const panelDocument = await loadMainPanel(controller);
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

    const panelDocument = await loadMainPanel(controller);
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

    const panelDocument = await loadMainPanel(controller);
    expect(panelDocument.querySelector('#control-panel-content')).not.toBe(null);
});

test('ensure the control panel is in correct state after injecting', async () => {
    chrome.runtime.onMessage.listener({
        msg: Messages.TAB_UPDATED,
        shouldBeVisible: true,
        minimized: true,
        onLeft: true
    }, null, null);

    await loadMainPanel(controller);
    const controlPanel = document.querySelector('.scraping-iframe-panel');
    expect(controlPanel.classList.contains('scraping-minimized')).toBe(true);
    expect(controlPanel.classList.contains('scraping-left')).toBe(true);
});

test('ensure the control panel is in correct state after injecting (before the message handler is set)', async () => {
    controller = new Controller();
    await controller.init(true, true, true);

    await loadMainPanel(controller);
    const controlPanel = document.querySelector('.scraping-iframe-panel');
    expect(controlPanel.classList.contains('scraping-minimized')).toBe(true);
    expect(controlPanel.classList.contains('scraping-left')).toBe(true);
});
