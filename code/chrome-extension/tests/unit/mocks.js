export class SelectEngineMockup {
    constructor() {
        this.selected = [];
        this._classes = ['scraping-class-1', 'scraping-class-2'];
        this._id = 0;
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
        return `scraping-${++this._id}`;
    }
}


export class SelectionMockup {
    constructor() {
        this._id = 0;
        this.toggled = undefined;
        this.pushedUndo = false;
    }

    toggle(elements, pushUndo = true) {
        this.toggled = elements;
        this.pushedUndo = pushUndo;
    }

    generateId() {
        return `scraping-${this._id++}`;
    }
}


export class ControllerMockup {
    constructor() {
        this.isDataValid = true;
        this.msg = [];
        this.nodes = [];
    }

    invalidateData() {
        this.isDataValid = false;
    }

    notify({ msg, nodes }) {
        this.msg.push(msg);
        this.nodes.push(nodes);
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