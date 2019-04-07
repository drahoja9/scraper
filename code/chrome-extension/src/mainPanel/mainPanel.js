import { Messages } from '../constants.js';
import { ColumnPool } from './columnPool.js';
import { registerClickHandler } from './utils.js';
import { toggleAutoselectConfirmation, Selectors } from './selectors.js';


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
        this._selectors = new Selectors();
        this._actionBtns = new ActionButtons(this._colsPool);

        this._minMaxBtn = document.querySelector('#min-max-btn');
        this._switchSidesBtn = document.querySelector('#switch-sides-btn');

        const rowsBtn = document.querySelector('#rows-btn');
        const colsBtn = document.querySelector('#cols-btn');
        this._active = rowsBtn;

        registerClickHandler(
            this._minMaxBtn,
            Messages.MINIMIZE_MAXIMIZE,
            this.minimizeMaximize.bind(this)
        );
        registerClickHandler(
            this._switchSidesBtn,
            Messages.SWITCH_SIDES,
            this.switchSides.bind(this)
        );
        registerClickHandler(
            rowsBtn,
            Messages.SELECTING_ROWS,
            this._switchRowsCols.bind(this)
        );
        registerClickHandler(
            colsBtn,
            Messages.SELECTING_COLS,
            this._switchRowsCols.bind(this)
        );
    }

    _switchRowsCols(event) {
        if (event.currentTarget === this._active) return;

        this._active.classList.remove('active');
        this._active = event.currentTarget;
        this._active.classList.add('active');

        this._colsPool.toggle();
        // this._selectors.switch(); TODO
    }

    minimizeMaximize() {
        this._minMaxBtn.classList.toggle('rotated');
    }

    switchSides() {
        document.querySelector('#name').classList.toggle('left');
        document.querySelector('#move-btn-group').classList.toggle('left');
        this._switchSidesBtn.classList.toggle('left');
        this._switchSidesBtn.classList.toggle('rotated');
        this._minMaxBtn.classList.toggle('left');
        this._minMaxBtn.classList.toggle('rotated');
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
            case Messages.SWITCH_SIDES:
                mainPanel.switchSides();
                break;
            case Messages.MINIMIZE_MAXIMIZE:
                mainPanel.minimizeMaximize();
                break;
        }
    });
});