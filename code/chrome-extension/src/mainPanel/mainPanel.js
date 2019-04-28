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
        this._redoBtn = document.querySelector('#redo-btn');

        const rowsBtn = document.querySelector('#rows-btn');
        const colsBtn = document.querySelector('#cols-btn');
        this._active = rowsBtn;

        this._rowsTooltip = document.querySelector('#rows-tooltip');
        this._colsTooltip = document.querySelector('#cols-tooltip');

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
            this.enableRedo.bind(this)
        );
        registerClickHandler(
            this._redoBtn,
            Messages.REDO
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

    _switchTooltips() {
        this._rowsTooltip.classList.toggle('active');
        this._colsTooltip.classList.toggle('active');
    }

    _switchRowsCols(event) {
        if (event.currentTarget === this._active) return;

        this._active.classList.remove('active');
        this._active = event.currentTarget;
        this._active.classList.add('active');

        this._colsPool.toggle();
        this._selectors.switchMouseSelectorColor();
        this._switchTooltips();
    }

    minimizeMaximize() {
        this._minMaxBtn.classList.toggle('rotated');
    }

    enableUndo() {
        this._undoBtn.classList.remove('disabled');
    }

    enableRedo() {
        this._redoBtn.classList.remove('disabled');
    }

    disableUndo() {
        this._undoBtn.classList.add('disabled');
    }

    disableRedo() {
        this._redoBtn.classList.add('disabled');
    }

    switchSides() {
        document.querySelector('#name').classList.toggle('left');
        document.querySelector('#tools-btn-group').classList.toggle('left');
        this._switchSidesBtn.classList.toggle('left');
        this._switchSidesBtn.classList.toggle('rotated');
        this._minMaxBtn.classList.toggle('left');
        this._minMaxBtn.classList.toggle('rotated');
        this._undoBtn.classList.toggle('left');
        this._redoBtn.classList.toggle('left');
    }
}


// ========================================================================================================

function init() {
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
            case Messages.ENABLE_UNDO:
                mainPanel.enableUndo();
                break;
            case Messages.ENABLE_REDO:
                mainPanel.enableRedo();
                break;
            case Messages.DISABLE_UNDO:
                mainPanel.disableUndo();
                break;
            case Messages.DISABLE_REDO:
                mainPanel.disableRedo();
                break;
        }
    });

    // $('[data-toggle="tooltip"]').tooltip();
}

document.addEventListener('DOMContentLoaded', function () {
    init();
});
