export class SelectEngineMockup {
    constructor() {
        this.selected = [];
        this._classes = ['scraping-class-1', 'scraping-class-2'];
        this._id = 'scraping-0';
    }

    areSelected(elements) {
        for (const element of elements) {
            if (!this.selected.includes(element)) {
                return false;
            }
        }
        return true;
    }

    select(elements) {
        for (const el of elements) {
            if (!this.selected.includes(el)) {
                this.selected.push(el);
            }
        }
    }

    unselect(elements) {
        for (const el of elements) {
            const idx = this.selected.indexOf(el);
            if (idx !== -1) {
                this.selected.splice(idx, 1);
            }
        }
    }

    toggle(elements) {
        if (this.areSelected(elements)) {
            this.unselect(elements);
            return false;
        } else {
            this.select(elements);
            return true;
        }
    }

    get classes() {
        return this._classes;
    }

    generateId() {
        const currentId = this._id.match(/scraping-(\d*)/)[1];
        this._id = `scraping-${Number(currentId) + 1}`;
        return this._id;
    }
}


export class ControllerMockup {
    constructor() {
        this.isDataValid = true;
    }

    invalidateData() {
        this.isDataValid = false;
    }

    notify({ msg, nodes }) {

    }
}


export class DOMNavigationMockup {
    constructor() {
        this.msg = undefined;
        this.nodes = undefined;
    }

    notify({ msg, nodes }) {
        this.msg = msg;
        this.nodes = nodes;
    }
}


export class UndoRedoStoreMockup {
    constructor() {
        this.pushedUndos = [];
        this.wasUndoCalled = false;
        this.wasRedoCalled = false;
        this.wasUndoChecked = false;
        this.wasRedoChecked = false;
    }

    pushUndo(elements) {
        this.pushedUndos.push(...elements);
    }

    undo() {
        this.wasUndoCalled = true;
    }

    redo() {
        this.wasRedoCalled = true;
    }

    checkUndo() {
        this.wasUndoChecked = true;
    }

    checkRedo() {
        this.wasRedoChecked = true;
    }
}