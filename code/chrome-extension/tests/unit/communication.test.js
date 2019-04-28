import { Communication } from "/src/contentScripts/communication.js";
import { Messages } from "/src/constants.js";
import { ControllerMockup, MainPanelControllerMockup } from "./mocks";
import { _postMessage } from "../utils.js";


// -------------------------------------------- Setup and teardown ----------------------------------------------

let controller;
let mainPanelController;
let communication;

beforeEach(async function () {
    global.chrome = {
        runtime: {
            onMessage: {
                listener: undefined,
                addListener: jest.fn(fn => global.chrome.runtime.onMessage.listener = fn)
            },
            getURL: jest.fn(url => url),
            sendMessage: jest.fn(msg => {
            })
        }
    };
    controller = new ControllerMockup();
    mainPanelController = new MainPanelControllerMockup();
    communication = new Communication(controller, mainPanelController);
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('processing messages from main panel', () => {
    communication.sendMessageToBackground = jest.fn(({ msg }) => {
    });
    mainPanelController.isVisible = true;

    communication.toggle();
    _postMessage(Messages.MINIMIZE_MAXIMIZE);
    expect(mainPanelController.toggleMinMax.mock.calls.length).toBe(1);
    expect(communication.sendMessageToBackground.mock.calls.length).toBe(1);
    expect(communication.sendMessageToBackground.mock.calls[0][0]).toEqual({ msg: Messages.MINIMIZE_MAXIMIZE });

    _postMessage(Messages.SWITCH_SIDES);
    expect(mainPanelController.switchSides.mock.calls.length).toBe(1);
    expect(communication.sendMessageToBackground.mock.calls.length).toBe(2);
    expect(communication.sendMessageToBackground.mock.calls[1][0]).toEqual({ msg: Messages.SWITCH_SIDES });

    _postMessage(Messages.ADDED_COL);
    expect(controller.invalidateData.mock.calls.length).toBe(1);
    _postMessage(Messages.RENAMED_COL);
    expect(controller.invalidateData.mock.calls.length).toBe(2);
    _postMessage(Messages.REMOVED_COL);
    expect(controller.invalidateData.mock.calls.length).toBe(3);

    for (const [msg, func] of [
        [Messages.SELECTING_ROWS, controller.selectingRows],
        [Messages.SELECTING_COLS, controller.selectingCols],
        [Messages.SELECTING_ELEMENTS, controller.toggleMouseSelector],
        [Messages.UNDO, controller.undo],
        [Messages.REDO, controller.redo],
        [Messages.CSS_UNSELECT, controller.cssUnselect],
    ]) {
        _postMessage(msg);
        expect(func.mock.calls.length).toBe(1);
    }

    for (const [msg, func, payload] of [
        [Messages.CHOSEN_COL, controller.changeCol, { data: 'some random data' }],
        [Messages.TEXT_SEARCH_CONTAINS, controller.textContains, { data: 'some random data' }],
        [Messages.TEXT_SEARCH_STARTS, controller.textStartsWith, { data: 'some random data' }],
        [Messages.TEXT_SEARCH_ENDS, controller.textEndsWith, { data: 'some random data' }],
        [Messages.CSS_SELECT, controller.cssSelect, { data: 'some random data' }],
        [Messages.DISPLAY_PREVIEW, controller.previewData, { data: 'some random data' }],
        [Messages.DOWNLOAD, controller.downloadData, { data: 'some random data' }]
    ]) {
        _postMessage(msg, payload);
        expect(func.mock.calls.length).toBe(1);
        expect(func.mock.calls[0][0]).toEqual(payload);
    }
});

test('turn communication on and off', () => {
    mainPanelController.isVisible = true;
    communication.toggle();
    _postMessage(Messages.ADDED_COL);
    expect(controller.invalidateData.mock.calls.length).toBe(1);

    mainPanelController.isVisible = true;
    communication.toggle();
    _postMessage(Messages.ADDED_COL);
    expect(controller.invalidateData.mock.calls.length).toBe(2);

    mainPanelController.isVisible = false;
    communication.toggle();
    _postMessage(Messages.ADDED_COL);
    expect(controller.invalidateData.mock.calls.length).toBe(2);

    mainPanelController.isVisible = false;
    communication.toggle();
    _postMessage(Messages.ADDED_COL);
    expect(controller.invalidateData.mock.calls.length).toBe(2);
});

test('send message to background script', () => {
    const msg = { msg: 'some message', payload: 'some data' };
    communication.sendMessageToBackground(msg);
    expect(chrome.runtime.sendMessage.mock.calls.length).toBe(1);
    expect(chrome.runtime.sendMessage.mock.calls[0][0]).toEqual(msg);
});

test('send message to main panel', () => {
    const msg = { msg: 'some message', payload: 'some data' };
    communication.sendMessageToMainPanel(msg);
    expect(mainPanelController.iframe.contentWindow.postMessage.mock.calls.length).toBe(1);
    expect(mainPanelController.iframe.contentWindow.postMessage.mock.calls[0][0]).toEqual({
        ...msg, type: Messages.FROM_CONTROLLER
    });
});

test('listening for messages from background script', () => {
    communication.toggle = jest.fn(() => {
    });

    chrome.runtime.onMessage.listener({
        msg: Messages.BROWSER_ACTION_CLICKED,
        minimized: false,
        onLeft: false
    }, null, null);
    expect(mainPanelController.toggleMainPanel.mock.calls.length).toBe(1);
    expect(communication.toggle.mock.calls.length).toBe(1);
    expect(mainPanelController.toggleMainPanel.mock.calls[0][0]).toBe(false);
    expect(mainPanelController.toggleMainPanel.mock.calls[0][1]).toBe(false);

    mainPanelController.isInjected = false;
    chrome.runtime.onMessage.listener({
        msg: Messages.TAB_UPDATED,
        shouldBeVisible: false,
        minimized: true,
        onLeft: true
    }, null, null);
    expect(mainPanelController.toggleMainPanel.mock.calls.length).toBe(1);
    expect(communication.toggle.mock.calls.length).toBe(1);

    mainPanelController.isInjected = true;
    chrome.runtime.onMessage.listener({
        msg: Messages.TAB_UPDATED,
        shouldBeVisible: true,
        minimized: true,
        onLeft: true
    }, null, null);
    expect(mainPanelController.toggleMainPanel.mock.calls.length).toBe(1);
    expect(communication.toggle.mock.calls.length).toBe(1);

    mainPanelController.isInjected = false;
    chrome.runtime.onMessage.listener({
        msg: Messages.TAB_UPDATED,
        shouldBeVisible: true,
        minimized: true,
        onLeft: true
    }, null, null);
    expect(mainPanelController.toggleMainPanel.mock.calls.length).toBe(2);
    expect(communication.toggle.mock.calls.length).toBe(2);
    expect(mainPanelController.toggleMainPanel.mock.calls[1][0]).toBe(true);
    expect(mainPanelController.toggleMainPanel.mock.calls[1][1]).toBe(true);
});
