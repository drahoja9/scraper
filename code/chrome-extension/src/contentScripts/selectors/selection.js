import { Messages } from '/src/constants.js';
import { isValid } from '../utils.js';


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
            this._scrapingClasses.forEach(cls => {
                element.classList.add(cls);
            });
            this._current.push(element);
        });
        this._controller.invalidateData();
        this._domNavigaton.notify({ msg: Messages.SELECTED, nodes: elements });
        this._controller.notify({ msg: Messages.SELECTED, nodes: elements });
    }

    unselect(elements) {
        elements.forEach(element => {
            this._scrapingClasses.forEach(cls => {
                element.classList.remove(cls);
            });
        });
        this._controller.invalidateData();
        this._domNavigaton.notify({ msg: Messages.SELECTED, nodes: elements });
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
        let selected = true;
        elements.forEach(element => {
            this._scrapingClasses.forEach(cls => {
                selected = element.classList.contains(cls);
            });
        });
        return selected;
    }

    get classes() {
        return this._scrapingClasses;
    }

    set classes(classList) {
        this._scrapingClasses = classList;
    }
}


export class RowSelection extends Selection {
    constructor(controller, domNavigation) {
        super(controller, domNavigation);
        this._scrapingClasses = ['scraping-selected-row'];
    }

    get isSelectingRows() {
        return true;
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
}
