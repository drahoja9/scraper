import { Messages } from '/src/constants.js';
import { isValid } from '../utils.js';
import { UndoRedoStore } from './undoRedoStore.js';


class Selection {
    constructor(controller, domNavigation, selectEngine) {
        this._scrapingClasses = undefined;
        this._controller = controller;
        this._selectEngine = selectEngine;
        this._domNavigaton = domNavigation;
        this._undoRedoStore = new UndoRedoStore(controller, this);
    }

    select(elements, shouldPushUndo = true) {
        if (elements.length === 0) return;

        let filtered = [];
        for (const element of elements) {
            if (!isValid(element) || this.areSelected([element])) continue;
            element.classList.add(...this._scrapingClasses);
            if (this._rowId !== undefined) {
                this._updateClasses(this._rowId + 1);
            }
            filtered.push(element);
        };
        this._controller.invalidateData();
        this._domNavigaton.notify({ msg: Messages.SELECTED, nodes: filtered });

        if (shouldPushUndo) {
            this._undoRedoStore.pushUndo(filtered);
        }
    }

    unselect(elements, shouldPushUndo = true) {
        this._controller.invalidateData();
        this._domNavigaton.notify({ msg: Messages.UNSELECTED, nodes: elements });

        if (shouldPushUndo) {
            this._undoRedoStore.pushUndo(elements);
        }
    }

    toggle(elements, shouldPushUndo = true) {
        const areSelected = this.areSelected(elements);
        if (areSelected) {
            this.unselect(elements, shouldPushUndo);
        } else {
            this.select(elements, shouldPushUndo);
        }
        return !areSelected;
    }

    areSelected(elements) {
        for (const element of elements) {
            for (const cls of this._scrapingClasses) {
                if (!element.classList.contains(cls)) {
                    return false;
                }
            }
        }
        return true;
    }

    undo() {
        this._undoRedoStore.undo();
    }

    redo() {
        this._undoRedoStore.redo();
    }

    checkUndoRedo() {
        this._undoRedoStore.checkUndo();
        this._undoRedoStore.checkRedo();
    }

    generateId() {
        return this._selectEngine.generateId();
    }

    _getId(element, scrapingClass) {
        const re = new RegExp(`${scrapingClass}-(\\d*)`);
        let match;
        if (element.className.match) {
            match = element.className.match(re);
        } else {
            const classes = Array.from(element.classList);
            match = classes.join(' ').match(re);
        }
        return match ? match[1] : null;
    }

    get classes() {
        return this._scrapingClasses;
    }

    set classes(classList) {
        this._scrapingClasses = classList;
    }

    get isSelectingRows() {
        throw Error('Not implemented!');
    }
}


export class RowSelection extends Selection {
    constructor(controller, domNavigation, selectEngine) {
        super(controller, domNavigation, selectEngine);
        this._rowId = 0;
        this._scrapingClasses = [
            'scraping-selected-row',
            `scraping-row-${this._rowId}`
        ];
        this.highlightingClass = 'scraping-highlighted-row';
    }

    unselect(elements, shouldPushUndo = true) {
        const rowId = this._rowId;
        elements.forEach(element => {
            const rowId = this._getRowId(element);
            this._updateClasses(rowId);
            element.classList.remove(...this._scrapingClasses);
        });
        this._updateClasses(rowId);
        super.unselect(elements, shouldPushUndo);
    }

    areSelected(elements) {
        const rowId = this._rowId;
        let selected = true;
        for (const element of elements) {
            const rowId = this._getRowId(element);
            this._updateClasses(rowId);
            if (!super.areSelected([element])) {
                selected = false;
                break;
            }
        }
        this._updateClasses(rowId);
        return selected;
    }

    get isSelectingRows() {
        return true;
    }

    _getRowId(element) {
        return super._getId(element, 'scraping-row');
    }

    _updateClasses(rowId) {
        this._rowId = rowId;
        this._scrapingClasses = [
            'scraping-selected-row',
            `scraping-row-${this._rowId}`
        ];
    }
}


export class ColumnSelection extends Selection {
    constructor(controller, domNavigation, colId, selectEngine) {
        super(controller, domNavigation, selectEngine);
        this._colId = colId;
        this._scrapingClasses = [
            'scraping-selected-col',
            `scraping-col-${this._colId}`,
            'scraping-active'
        ];
        this.highlightingClass = 'scraping-highlighted-col';
    }

    unselect(elements, shouldPushUndo = true) {
        elements.forEach(element => {
            element.classList.remove(...this._scrapingClasses);
        });
        super.unselect(elements, shouldPushUndo);
    }

    activateColumn() {
        document
            .querySelectorAll('.scraping-active')
            .forEach(node => node.classList.remove('scraping-active'));
        document
            .querySelectorAll(`.scraping-col-${this._colId}`)
            .forEach(node => node.classList.add('scraping-active'));
    }

    get isSelectingRows() {
        return false;
    }

    getColId(element) {
        return super._getId(element, 'scraping-col');
    }

    _updateClasses(colId) {
        this._colId = colId;
        this._scrapingClasses = [
            'scraping-selected-col',
            `scraping-col-${this._colId}`,
            'scraping-active'
        ];
    }
}
