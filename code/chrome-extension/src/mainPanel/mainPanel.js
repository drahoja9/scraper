import { Messages } from '../constants.js';
import { ColumnPool } from './columnPool.js';
import { registerClickHandler, registerInputHandler, sendMessageToContentScript } from './utils.js';


function toggleAutoselectConfirmation({ shouldEnable }) {
    const alert = document.querySelector('#auto-select-alert');
    const acceptAutoSelectBtn = document.querySelector('#accept-auto-select');
    const rejectAutoSelectBtn = document.querySelector('#reject-auto-select');

    if (shouldEnable !== undefined) {
        acceptAutoSelectBtn.disabled = !shouldEnable;
        rejectAutoSelectBtn.disabled = !shouldEnable;
        if (shouldEnable) {
            alert.classList.add('show');
        } else {
            alert.classList.remove('show');
        }
    } else if (acceptAutoSelectBtn.disabled) {
        acceptAutoSelectBtn.disabled = false;
        rejectAutoSelectBtn.disabled = false;
        alert.classList.add('show');
    } else {
        acceptAutoSelectBtn.disabled = true;
        rejectAutoSelectBtn.disabled = true;
        alert.classList.remove('show');
    }
}


class RowsColsSwitcher {
    constructor(colsPool) {
        const rowsBtn = document.querySelector('#rows-btn');
        const colsBtn = document.querySelector('#cols-btn');
        this._colsPool = colsPool;
        this._active = rowsBtn;

        registerClickHandler(rowsBtn, Messages.SELECTING_ROWS, this._switch.bind(this));
        registerClickHandler(colsBtn, Messages.SELECTING_COLS, this._switch.bind(this));
    }

    _switch(event) {
        if (event.currentTarget === this._active) return;

        this._active.classList.remove('active');
        this._active = event.currentTarget;
        this._active.classList.add('active');

        this._colsPool.toggle();
    }
}


// ========================================================================================================


$(function () {
    const selectElementsBtn = document.querySelector('#select-elements-btn');

    const acceptAutoSelectBtn = document.querySelector('#accept-auto-select');
    const rejectAutoSelectBtn = document.querySelector('#reject-auto-select');

    const textSearchContainsInput = document.querySelector('#text-search-contains');
    const containsExactCheck = document.querySelector('#contains-exact');
    const textSearchStartsInput = document.querySelector('#text-search-starts');
    const textSearchEndsInput = document.querySelector('#text-search-ends');

    const previewBtn = document.querySelector('#preview-btn');
    const downloadBtn = document.querySelector('#download-btn');
    const exportSelect = document.querySelector('#export-select');

    const colsPool = new ColumnPool();
    const switcher = new RowsColsSwitcher(colsPool);

    toggleAutoselectConfirmation({});

    registerClickHandler(selectElementsBtn, Messages.SELECTING_ELEMENTS, () => { selectElementsBtn.classList.toggle('toggled-btn'); })
    registerClickHandler(acceptAutoSelectBtn, Messages.ACCEPT_AUTO_SELECT, toggleAutoselectConfirmation)
    registerClickHandler(rejectAutoSelectBtn, Messages.REJECT_AUTO_SELECT, toggleAutoselectConfirmation)
    registerInputHandler(
        textSearchContainsInput,
        Messages.TEXT_SEARCH_CONTAINS,
        containsExactCheck
    );
    registerInputHandler(
        textSearchStartsInput,
        Messages.TEXT_SEARCH_STARTS
    );
    registerInputHandler(
        textSearchEndsInput,
        Messages.TEXT_SEARCH_ENDS
    );
    registerClickHandler(previewBtn, '', () => {
        sendMessageToContentScript(Messages.DISPLAY_PREVIEW, { cols: colsPool.getCols() });
    });
    registerClickHandler(downloadBtn, '', () => {
        sendMessageToContentScript(Messages.DOWNLOAD, { format: exportSelect.value, cols: colsPool.getCols() });
    });

    window.addEventListener('message', (event) => {
        if (event.data.type !== Messages.FROM_CONTROLLER) {
            return;
        }
        switch (event.data.msg) {
            case Messages.DECIDING_AUTO_SELECT:
                toggleAutoselectConfirmation({ shouldEnable: true });
                break;
        }
    });
});