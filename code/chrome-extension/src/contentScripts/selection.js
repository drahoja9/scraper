import { Messages } from '/src/constants.js';
import { isValid } from './utils.js';


class Selection {
    constructor(controller, domNavigation, selectEngine) {
        this._scrapingClasses = undefined;
        this._controller = controller;
        this._selectEngine = selectEngine;
        this._domNavigaton = domNavigation;
        this._undos = [];
        this._redos = [];
    }

    select(elements) {
        if (!elements) return;

        let filtered = [];
        elements.forEach(element => {
            if (!isValid(element) || this.areSelected([element])) return;
            element.classList.add(...this._scrapingClasses);
            if (this._rowId !== undefined) {
                this._updateClasses(++this._rowId);
            }
            filtered.push(element);
        });
        this._controller.invalidateData();
        this._domNavigaton.notify({ msg: Messages.SELECTED, nodes: filtered });
        this._controller.notify({ msg: Messages.SELECTED, nodes: filtered });
        this._pushUndo(filtered);
    }

    unselect(elements) {
        this._controller.invalidateData();
        this._domNavigaton.notify({ msg: Messages.UNSELECTED, nodes: elements });
        this._pushUndo(elements);
    }

    toggle(elements) {
        const areSelected = this.areSelected(elements);
        if (areSelected) {
            this.unselect(elements);
        } else {
            this.select(elements);
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
        const selector = this._undos.pop();
        const elements = document.querySelectorAll(selector);
        const tmpRedos = this._redos;

        this.toggle(elements);
        this._undos.pop();
        this._redos = tmpRedos;
        this._redos.push(selector);

        if (this._undos.length === 0) {
            this._controller.notify({ msg: Messages.DISABLE_UNDO });
        }
    }

    redo() {
        const selector = this._redos.pop();
        const elements = document.querySelectorAll(selector);
        const tmpRedos = this._redos;

        this.toggle(elements);
        this._undos.pop();
        this._redos = tmpRedos;
        this._undos.push(selector);

        if (this._redos.length === 0) {
            this._controller.notify({ msg: Messages.DISABLE_REDO });
        }
    }

    _pushUndo(elements) {
        let selectors = [];
        for (const element of elements) {
            const id = element.id || this._selectEngine.generateId();
            element.id = id;
            selectors.push(`#${id}`);
        }
        this._undos.push(selectors.join(','));
        this._redos = [];
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

    unselect(elements, all = false) {
        elements.forEach(element => {
            const rowId = this._getRowId(element);
            this._updateClasses(rowId);
            element.classList.remove(...this._scrapingClasses);
        });
        this._updateClasses(this._rowId);
        super.unselect(elements);
    }

    areSelected(elements) {
        let selected = true;
        for (const element of elements) {
            const rowId = this._getRowId(element);
            this._updateClasses(rowId);
            if (!super.areSelected([element])) {
                selected = false;
                break;
            }
        }
        this._updateClasses(this._rowId);
        return selected;
    }

    get isSelectingRows() {
        return true;
    }

    _getRowId(element) {
        return super._getId(element, 'scraping-row');
    }

    _updateClasses(rowId) {
        this._scrapingClasses = [
            'scraping-selected-row',
            `scraping-row-${rowId}`
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

    unselect(elements, all = false) {
        elements.forEach(element => {
            if (all) {
                const colId = this._getColId(element);
                this._updateClasses(colId);
            }
            element.classList.remove(...this._scrapingClasses);
        });
        this._updateClasses(this._colId);
        super.unselect(elements);
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

    _getColId(element) {
        return super._getId(element, 'scraping-col');
    }

    _updateClasses(colId) {
        this._scrapingClasses = [
            'scraping-selected-col',
            `scraping-col-${colId}`,
            'scraping-active'
        ];
    }
}
