import { _click, _doubleClick, _enterKeyDown, _focusOut, _mouseenter, insertMainPanelScripts } from "../utils.js";
import { Messages } from "/src/constants.js";


export function action(cb, waitForMsg) {
    return new Promise(resolve => {
        window.addEventListener('message', event => {
            if (event.data.msg === waitForMsg) {
                resolve();
            }
        });
        cb();
    });
}

export function loadMainPanel(controller) {
    return new Promise(resolve => {
        const panelIframe = controller._mainPanelController.iframe;
        const panelDocument = panelIframe.contentWindow.window.document;

        panelIframe.addEventListener('load', () => {
            insertMainPanelScripts(panelDocument);
            const mainPanelInit = panelIframe.contentWindow.window.init;
            mainPanelInit();
            resolve(panelDocument);
        });
    });
}

export async function startExtension(controller) {
    chrome.runtime.onMessage.listener({
        msg: Messages.BROWSER_ACTION_CLICKED
    }, null, null);
    return await loadMainPanel(controller);
}

export async function startMouseSelection(panelDocument) {
    const basicsCard = panelDocument.querySelector('#select-basics');
    const selectSwitch = panelDocument.querySelector('#select-elements-checkbox');
    _click(basicsCard);

    // Start selecting elements -- activate MouseSelector
    await action(() => {
        _click(selectSwitch)
    }, Messages.SELECTING_ELEMENTS);
}

async function _textSelect(panelDocument, message, id, value, exact = false) {
    const textCard = panelDocument.querySelector('#select-text');
    const textForm = panelDocument.querySelector(id);
    _click(textCard);
    textForm.value = value;

    if (exact) {
        const exactCheck = panelDocument.querySelector('#contains-exact');
        exactCheck.checked = true;
    }
    await action(() => {
        _enterKeyDown(textForm);
    }, message);
}

export async function textSelectContains(panelDocument, value, exact = false) {
    return _textSelect(panelDocument, Messages.TEXT_SEARCH_CONTAINS, '#text-search-contains', value, exact);
}

export async function textSelectStartsWith(panelDocument, value) {
    return _textSelect(panelDocument, Messages.TEXT_SEARCH_STARTS, '#text-search-starts', value);
}

export async function textSelectEndsWith(panelDocument, value) {
    return _textSelect(panelDocument, Messages.TEXT_SEARCH_ENDS, '#text-search-ends', value);
}

export async function cssSelect(panelDocument, selector) {
    const cssCard = panelDocument.querySelector('#select-css');
    const cssInput = panelDocument.querySelector('#css-input');
    _click(cssCard);
    cssInput.value = selector;
    await action(() => {
        _enterKeyDown(cssInput);
    }, Messages.CSS_SELECT);
}

export async function parentElement(node) {
    const btn = document.querySelector('#zoom-out');
    _mouseenter(node);
    _click(btn);
}

export async function firstChildElement(node) {
    const btn = document.querySelector('#zoom-in');
    _mouseenter(node);
    _click(btn);
}

export async function previousSiblingElement(node) {
    const btn = document.querySelector('#zoom-prev');
    _mouseenter(node);
    _click(btn);
}

export async function nextSiblingElement(node) {
    const btn = document.querySelector('#zoom-next');
    _mouseenter(node);
    _click(btn);
}

export async function cssEnterEmptySelector(panelDocument) {
    const cssCard = panelDocument.querySelector('#select-css');
    const cssInput = panelDocument.querySelector('#css-input');
    _click(cssCard);
    cssInput.value = '';
    await action(() => {
        _enterKeyDown(cssInput);
    }, Messages.CSS_UNSELECT);
}

export async function selectingCols(panelDocument) {
    const colsBtn = panelDocument.querySelector('#cols-btn');
    await action(() => {
        _click(colsBtn)
    }, Messages.SELECTING_COLS);
}

export async function selectingRows(panelDocument) {
    const rowsBtn = panelDocument.querySelector('#rows-btn');
    await action(() => {
        _click(rowsBtn);
    }, Messages.SELECTING_ROWS);
}

export async function switchToCol(panelDocument, colId) {
    const columnBtns = panelDocument.querySelectorAll('.col-btn');
    const colBtn = Array.from(columnBtns).filter(btn => btn.id === colId)[0];
    await action(() => {
        _click(colBtn);
    }, Messages.CHOSEN_COL);
}

export async function createNewCol(panelDocument, colName) {
    const addBtn = panelDocument.querySelector('#add-col-btn');
    await action(() => {
        _click(addBtn);
    }, Messages.ADDED_COL);

    const allColBtns = panelDocument.querySelectorAll('.col-btn');
    // The last `.col-btn` is the add button, so we want the one before
    const newColBtn = allColBtns[allColBtns.length - 2];

    if (colName) {
        await action(() => {
            _doubleClick(newColBtn);
        }, Messages.RENAMED_COL);
        const nameForm = newColBtn.querySelector('.col-rename');
        nameForm.value = colName;
        _focusOut(nameForm);
    }

    return newColBtn.id;
}

export async function renameCol(panelDocument, colId, newName) {
    const allBtns = Array.from(panelDocument.querySelectorAll('.col-btn'));
    const colBtn = allBtns.filter(btn => btn.id === colId)[0];
    await action(() => {
        _doubleClick(colBtn);
    }, Messages.RENAMED_COL);
    const nameForm = colBtn.querySelector('.col-rename');
    nameForm.value = newName;
    _focusOut(nameForm);
}

export async function undo(panelDocument) {
    const undoBtn = panelDocument.querySelector('#undo-btn');
    await action(() => {
        _click(undoBtn);
    }, Messages.UNDO);
}

export async function redo(panelDocument) {
    const redoBtn = panelDocument.querySelector('#redo-btn');
    await action(() => {
        _click(redoBtn);
    }, Messages.REDO);
}

export async function displayPreview(panelDocument) {
    const previewBtn = panelDocument.querySelector('#preview-btn');
    await action(() => {
        _click(previewBtn);
    }, Messages.DISPLAY_PREVIEW);
}

export function removeRowFromPreview(row) {
    _click(row.firstElementChild.firstElementChild);
}
