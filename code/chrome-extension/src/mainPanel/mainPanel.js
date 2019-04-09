import { Messages } from '../constants.js';
import { ColumnPool } from './columnPool/columnPool.js';
import { registerClickHandler } from './utils.js';
import { Selectors } from './selectors.js';


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
        this._undoBtn = document.querySelector('#undo-btn');

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
            this._undoBtn,
            Messages.UNDO,
            this.hideUndoBtn.bind(this)
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
        this._selectors.switchMouseSelectorColor();
    }

    minimizeMaximize() {
        this._minMaxBtn.classList.toggle('rotated');
    }

    showUndoBtn() {
        this._undoBtn.style.display = 'block';
    }

    hideUndoBtn() {
        this._undoBtn.style.display = 'none';
    }

    switchSides() {
        document.querySelector('#name').classList.toggle('left');
        document.querySelector('#tools-btn-group').classList.toggle('left');
        this._switchSidesBtn.classList.toggle('left');
        this._switchSidesBtn.classList.toggle('rotated');
        this._minMaxBtn.classList.toggle('left');
        this._minMaxBtn.classList.toggle('rotated');
        this._undoBtn.classList.toggle('left');
    }
}


// ========================================================================================================


$(function () {
    const mainPanel = new MainPanel();

    window.addEventListener('message', (event) => {
        if (event.data.type !== Messages.FROM_CONTROLLER) {
            return;
        }
        switch (event.data.msg) {
            case Messages.SWITCH_SIDES:
                mainPanel.switchSides();
                break;
            case Messages.MINIMIZE_MAXIMIZE:
                mainPanel.minimizeMaximize();
                break;
            case Messages.SELECTED:
                mainPanel.showUndoBtn();
                break;
        }
    });
});