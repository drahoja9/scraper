import { Messages } from '../constants.js';


export class UndoRedoStore {
    constructor(controller, selection) {
        this._controller = controller;
        this._selection = selection;
        this._undos = [];
        this._redos = [];
    }

    undo() {
        const selector = this._popUndo();
        const elements = document.querySelectorAll(selector);

        this._selection.toggle(elements, false);
        this._pushRedo(selector);
    }

    redo() {
        const selector = this._popRedo();
        const elements = document.querySelectorAll(selector);

        this._selection.toggle(elements, false);
        this._pushUndo(selector);
    }

    pushUndo(selector) {
        this._pushUndo(selector);
        this._clearRedos();
    }

    checkUndo() {
        if (this._undos.length === 0) {
            this._controller.notify({ msg: Messages.DISABLE_UNDO });
        } else {
            this._controller.notify({ msg: Messages.ENABLE_UNDO });
        }
    }

    checkRedo() {
        if (this._redos.length === 0) {
            this._controller.notify({ msg: Messages.DISABLE_REDO });
        } else {
            this._controller.notify({ msg: Messages.ENABLE_REDO })
        }
    }

    _pushUndo(selector) {
        this._undos.push(selector);
        this._controller.notify({ msg: Messages.ENABLE_UNDO });
    }

    _pushRedo(selector) {
        this._redos.push(selector);
        this._controller.notify({ msg: Messages.ENABLE_REDO })
    }

    _popUndo() {
        const selector = this._undos.pop();
        this.checkUndo();
        return selector;
    }

    _popRedo() {
        const selector = this._redos.pop();
        this.checkRedo();
        return selector;
    }

    _clearRedos() {
        this._redos = [];
        this._controller.notify({ msg: Messages.DISABLE_REDO });
    }
}