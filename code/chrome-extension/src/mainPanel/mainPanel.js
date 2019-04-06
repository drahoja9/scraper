import { Messages } from '../constants.js';
import { ColumnPool } from './columnPool.js';
import { registerClickHandler } from './utils.js';
import { toggleAutoselectConfirmation, Selectors } from './selectors.js';


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


class ActionButtons {
    constructor(colsPool) {
        this._previewBtn = document.querySelector('#preview-btn');
        this._downloadBtn = document.querySelector('#download-btn');
        this._formatSelect = document.querySelector('#format-select');

        registerClickHandler(
            this._previewBtn,
            Messages.DISPLAY_PREVIEW,
            () => { },
            () => ({ cols: colsPool.getCols() })
        );
        registerClickHandler(
            this._downloadBtn,
            Messages.DOWNLOAD,
            () => { },
            () => ({ format: this._formatSelect.value, cols: colsPool.getCols() })
        );
    }
}


class MainPanel {
    constructor() {
        this._colsPool = new ColumnPool();
        this._switcher = new RowsColsSwitcher(this._colsPool);
        this._selectors = new Selectors();
        this._actionBtns = new ActionButtons(this._colsPool);
    }
}


// ========================================================================================================


$(function () {
    const mainPanel = new MainPanel();
    toggleAutoselectConfirmation({});

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