import { Messages } from '/src/constants.js';
import { isValid } from './utils.js';


class Selection {
    constructor(controller, domNavigation) {
        this._current = undefined;
        this._scrapingClasses = undefined;
        this._controller = controller;
        this._domNavigaton = domNavigation;
    }

    select(elements) {
        this._current = [];
        elements.forEach(element => {
            if (!isValid(element) || this.areSelected([element])) return;
            element.classList.add(...this._scrapingClasses);
            if (this._rowId !== undefined) {
                this._updateClasses(++this._rowId);
            }
            this._current.push(element);
        });
        this._controller.invalidateData();
        this._domNavigaton.notify({ msg: Messages.SELECTED, nodes: elements });
        this._controller.notify({ msg: Messages.SELECTED, nodes: elements });
    }

    unselect(elements) {
        this._controller.invalidateData();
        this._domNavigaton.notify({ msg: Messages.UNSELECTED, nodes: elements });
        if (this._current === elements) {
            this._current = undefined;
        }
    }

    unselectCurrent() {
        if (this._current) {
            this.unselect(this._current);
        }
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
    constructor(controller, domNavigation) {
        super(controller, domNavigation);
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
        const match = element.className.match(/scraping-row-(\d*)/);
        return match ? match[1] : null;
    }

    _updateClasses(rowId) {
        this._scrapingClasses = [
            'scraping-selected-row',
            `scraping-row-${rowId}`
        ];
    }
}


export class ColumnSelection extends Selection {
    constructor(controller, domNavigation, colId) {
        super(controller, domNavigation);
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
        const match = element.className.match(/scraping-col-(\d*)/);
        return match ? match[1] : null;
    }

    _updateClasses(colId) {
        this._scrapingClasses = [
            'scraping-selected-col',
            `scraping-col-${colId}`,
            'scraping-active'
        ];
    }
}
