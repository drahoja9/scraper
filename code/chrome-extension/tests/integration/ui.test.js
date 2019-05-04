import { Controller } from "/src/contentScripts/controller.js";
import { Messages } from "/src/constants.js";
import { _click, insertMainPanelScripts } from "../utils.js";
import { DOMWindowSetup } from "./integrationSetup.js";
import { _doubleClick, _enterKeyDown, _focusOut } from "../utils";


// -------------------------------------------- Setup and teardown ----------------------------------------------

let controller;
let panelDocument;

beforeEach(async function () {
    await DOMWindowSetup();
    controller = new Controller();
    await controller.init(false, false, false);
    await startExtension();
});

// -------------------------------------------------- Tests -----------------------------------------------------

function action(cb, waitForMsg) {
    return new Promise(resolve => {
        window.addEventListener('message', event => {
            if (event.data.msg === waitForMsg) {
                resolve();
            }
        });
        cb();
    });
}

function loadMainPanel() {
    return new Promise(resolve => {
        const panelIframe = controller._mainPanelController.iframe;
        panelDocument = panelIframe.contentWindow.window.document;

        panelIframe.addEventListener('load', () => {
            insertMainPanelScripts(panelDocument);
            const mainPanelInit = panelIframe.contentWindow.window.init;
            mainPanelInit();
            resolve();
        });
    });
}

async function startExtension() {
    chrome.runtime.onMessage.listener({
        msg: Messages.BROWSER_ACTION_CLICKED
    }, null, null);
    await loadMainPanel();
}

// -------------------------------------------------- Helpers -----------------------------------------------------

test('switch sides of the control panel', async () => {
    const switchBtn = panelDocument.querySelector('#switch-sides-btn');
    const minMaxBtn = panelDocument.querySelector('#min-max-btn');
    const undoBtn = panelDocument.querySelector('#undo-btn');
    const redoBtn = panelDocument.querySelector('#redo-btn');
    const name = panelDocument.querySelector('#name');
    const toolbar = panelDocument.querySelector('#tools-btn-group');

    await action(() => {
        _click(switchBtn);
    }, Messages.SWITCH_SIDES);

    expect(name.classList.contains('left')).toBe(true);
    expect(toolbar.classList.contains('left')).toBe(true);
    expect(switchBtn.classList.contains('left')).toBe(true);
    expect(switchBtn.classList.contains('rotated')).toBe(true);
    expect(minMaxBtn.classList.contains('left')).toBe(true);
    expect(minMaxBtn.classList.contains('rotated')).toBe(true);
    expect(undoBtn.classList.contains('left')).toBe(true);
    expect(redoBtn.classList.contains('left')).toBe(true);

    expect(controller.mainPanelIframe.classList.contains('scraping-left')).toBe(true);
    expect(controller.mainPanelIframe.classList.contains('scraping-right')).toBe(false);
    expect(chrome.runtime.sendMessage.mock.calls.length).toBe(1);
    expect(chrome.runtime.sendMessage.mock.calls[0][0]).toEqual({ msg: Messages.SWITCH_SIDES });

    await action(() => {
        _click(switchBtn);
    }, Messages.SWITCH_SIDES);

    expect(name.classList.contains('left')).toBe(false);
    expect(toolbar.classList.contains('left')).toBe(false);
    expect(switchBtn.classList.contains('left')).toBe(false);
    expect(switchBtn.classList.contains('rotated')).toBe(false);
    expect(minMaxBtn.classList.contains('left')).toBe(false);
    expect(minMaxBtn.classList.contains('rotated')).toBe(false);
    expect(undoBtn.classList.contains('left')).toBe(false);
    expect(redoBtn.classList.contains('left')).toBe(false);

    expect(controller.mainPanelIframe.classList.contains('scraping-left')).toBe(false);
    expect(controller.mainPanelIframe.classList.contains('scraping-right')).toBe(true);
    expect(chrome.runtime.sendMessage.mock.calls.length).toBe(2);
    expect(chrome.runtime.sendMessage.mock.calls[1][0]).toEqual({ msg: Messages.SWITCH_SIDES });
});

test('minimize and maximize the control panel', async () => {
    const minMaxBtn = panelDocument.querySelector('#min-max-btn');

    await action(() => {
        _click(minMaxBtn);
    }, Messages.MINIMIZE_MAXIMIZE);

    expect(minMaxBtn.classList.contains('rotated')).toBe(true);
    expect(minMaxBtn.title).toEqual('Maximize');

    expect(controller.mainPanelIframe.classList.contains('scraping-minimized')).toBe(true);
    expect(chrome.runtime.sendMessage.mock.calls.length).toBe(1);
    expect(chrome.runtime.sendMessage.mock.calls[0][0]).toEqual({ msg: Messages.MINIMIZE_MAXIMIZE });

    await action(() => {
        _click(minMaxBtn);
    }, Messages.MINIMIZE_MAXIMIZE);

    expect(minMaxBtn.classList.contains('rotated')).toBe(false);
    expect(minMaxBtn.title).toEqual('Minimize');

    expect(controller.mainPanelIframe.classList.contains('scraping-minimized')).toBe(false);
    expect(chrome.runtime.sendMessage.mock.calls.length).toBe(2);
    expect(chrome.runtime.sendMessage.mock.calls[1][0]).toEqual({ msg: Messages.MINIMIZE_MAXIMIZE });
});

test('switching between rows and columns', async () => {
    const rowsBtn = panelDocument.querySelector('#rows-btn');
    const colsBtn = panelDocument.querySelector('#cols-btn');
    const rowsTooltip = panelDocument.querySelector('#rows-tooltip');
    const colsTooltip = panelDocument.querySelector('#cols-tooltip');
    const switchBtn = panelDocument.querySelector('#select-elements-switch');
    const colsWrapper = panelDocument.querySelector('.cols-pool-border');

    await action(() => {
        _click(colsBtn);
    }, Messages.SELECTING_COLS);

    expect(rowsBtn.classList.contains('active')).toBe(false);
    expect(colsBtn.classList.contains('active')).toBe(true);
    expect(rowsTooltip.classList.contains('active')).toBe(false);
    expect(colsTooltip.classList.contains('active')).toBe(true);
    expect(switchBtn.classList.contains('switch-row')).toBe(false);
    expect(switchBtn.classList.contains('switch-col')).toBe(true);
    expect(colsWrapper.classList.contains('hidden')).toBe(false);

    expect(controller._selectEngine._currentSelection).toBe(controller._selectEngine._columns[0]);

    await action(() => {
        _click(rowsBtn);
    }, Messages.SELECTING_ROWS);

    expect(rowsBtn.classList.contains('active')).toBe(true);
    expect(colsBtn.classList.contains('active')).toBe(false);
    expect(rowsTooltip.classList.contains('active')).toBe(true);
    expect(colsTooltip.classList.contains('active')).toBe(false);
    expect(switchBtn.classList.contains('switch-row')).toBe(true);
    expect(switchBtn.classList.contains('switch-col')).toBe(false);
    expect(colsWrapper.classList.contains('hidden')).toBe(true);

    expect(controller._selectEngine._currentSelection).toBe(controller._selectEngine._rows);
});

test('add a new column', async () => {
    const colsBtn = panelDocument.querySelector('#cols-btn');
    const addBtn = panelDocument.querySelector('#add-col-btn');
    const colsPool = panelDocument.querySelector('.cols-pool');

    await action(() => {
        _click(colsBtn);
    }, Messages.SELECTING_COLS);

    const col0 = panelDocument.querySelectorAll('.col-btn')[0];
    expect(colsPool.children.length).toBe(2);
    expect(col0.classList.contains('active')).toBe(true);
    expect(col0.id).toEqual('0');

    controller._dataEngine.isDataValid = true;

    await action(() => {
        _click(addBtn);
    }, Messages.ADDED_COL);

    const col1 = panelDocument.querySelectorAll('.col-btn')[1];
    expect(colsPool.children.length).toBe(3);
    expect(col1.classList.contains('active')).toBe(false);
    expect(col1.id).toEqual('1');

    expect(controller._dataEngine.isDataValid).toBe(false);
});

test('activate a column', async () => {
    const colsBtn = panelDocument.querySelector('#cols-btn');
    const addBtn = panelDocument.querySelector('#add-col-btn');

    await action(() => {
        _click(colsBtn);
    }, Messages.SELECTING_COLS);

    const col0 = panelDocument.querySelectorAll('.col-btn')[0];
    expect(col0.classList.contains('active')).toBe(true);
    expect(controller._selectEngine._currentCol).toBe('0');

    await action(() => {
        _click(addBtn);
    }, Messages.ADDED_COL);

    const col1 = panelDocument.querySelectorAll('.col-btn')[1];
    expect(col1.classList.contains('active')).toBe(false);
    expect(controller._selectEngine._currentCol).toBe('0');

    await action(() => {
        _click(col1);
    }, Messages.CHOSEN_COL);

    expect(col0.classList.contains('active')).toBe(false);
    expect(col1.classList.contains('active')).toBe(true);
    expect(controller._selectEngine._currentCol).toBe('1');
});

test('rename a column', async () => {
    const colsBtn = panelDocument.querySelector('#cols-btn');
    const col0 = panelDocument.querySelectorAll('.col-btn')[0];
    const nameForm = col0.querySelector('.col-rename');
    const name = col0.querySelector('.col-name');

    expect(name.innerText).toEqual('Column #1');
    expect(getComputedStyle(name).display).toEqual('block');
    expect(getComputedStyle(nameForm).display).toEqual('none');

    await action(() => {
        _click(colsBtn);
    }, Messages.SELECTING_COLS);

    controller._dataEngine.isDataValid = true;
    await action(() => {
        _doubleClick(col0);
    }, Messages.RENAMED_COL);
    expect(controller._dataEngine.isDataValid).toBe(false);

    expect(name.style.display).toEqual('none');
    expect(nameForm.style.display).toEqual('block');

    nameForm.value = 'Custom column name #1';
    _focusOut(nameForm);
    expect(name.style.display).toEqual('block');
    expect(nameForm.style.display).toEqual('none');
    expect(name.innerText).toEqual('Custom column name #1');

    await action(() => {
        _doubleClick(col0);
    }, Messages.RENAMED_COL);

    nameForm.value = 'Back to Column #1';
    _enterKeyDown(nameForm);
    expect(name.style.display).toEqual('block');
    expect(nameForm.style.display).toEqual('none');
    expect(name.innerText).toEqual('Back to Column #1');
});

test('remove a column', async () => {
    const colsBtn = panelDocument.querySelector('#cols-btn');
    const colsPool = panelDocument.querySelector('.cols-pool');
    const removeBtn = panelDocument.querySelector('.col-remove');

    await action(() => {
        _click(colsBtn);
    }, Messages.SELECTING_COLS);

    expect(colsPool.children.length).toBe(2);

    controller._dataEngine.isDataValid = true;
    await action(() => {
        _click(removeBtn);
    }, Messages.REMOVED_COL);
    expect(controller._dataEngine.isDataValid).toBe(false);

    expect(colsPool.children.length).toBe(1);
    expect(panelDocument.querySelectorAll('.col-btn').length).toBe(1);
});

test('unfold and fold a card', async () => {
    const basics = panelDocument.querySelector('#select-basics');
    const basicsBody = panelDocument.querySelector('#basics-collapse');
    const text = panelDocument.querySelector('#select-text');
    const textBody = panelDocument.querySelector('#text-collapse');
    const css = panelDocument.querySelector('#select-css');
    const cssBody = panelDocument.querySelector('#css-collapse');

    _click(basics);
    expect(basics.classList.contains('collapsed')).toBe(false);
    expect(text.classList.contains('collapsed')).toBe(true);
    expect(css.classList.contains('collapsed')).toBe(true);
    expect(basicsBody.classList.contains('collapsing')).toBe(true);
    expect(textBody.classList.contains('collapsing')).toBe(false);
    expect(cssBody.classList.contains('collapsing')).toBe(false);

    _click(basics);
    expect(basics.classList.contains('collapsed')).toBe(false);
    expect(text.classList.contains('collapsed')).toBe(true);
    expect(css.classList.contains('collapsed')).toBe(true);
    expect(basicsBody.classList.contains('collapsing')).toBe(true);
    expect(textBody.classList.contains('collapsing')).toBe(false);
    expect(cssBody.classList.contains('collapsing')).toBe(false);
});

test('css selector validation', async () => {
    const cssInput = panelDocument.querySelector('#css-input');
    const cssCard = panelDocument.querySelector('#select-css');

    _click(cssCard);

    cssInput.value = '.some-valid-selector > img > p:empty';
    _enterKeyDown(cssInput);
    expect(cssInput.classList.contains('invalid')).toBe(false);

    cssInput.value = '.#$+_%@#$invalidSelect.....or';
    _enterKeyDown(cssInput);
    expect(cssInput.classList.contains('invalid')).toBe(true);

    cssInput.value = '';
    _enterKeyDown(cssInput);
    expect(cssInput.classList.contains('invalid')).toBe(false);
});
