import { MouseSelector } from './mouseSelector.js';
import { TextSelector } from './textSelector.js';
import { DOMNavigaton } from './domNavigation.js';


export class SelectEngine {
    constructor(controller) {
        this.isSelectingRows = true;
        this._currentCol = 0;
        this._scrapingClasses = ['scraping-selected-row'];

        this._controller = controller;
        this._mouseSelector = new MouseSelector(this);
        this._textSelector = new TextSelector(this);
        this._domNavigaton = new DOMNavigaton(this);

        this._mouseSelector.addObserver(this);
        this._mouseSelector.addObserver(this._domNavigaton);
    }

    select(element) {
        this._scrapingClasses.forEach(cls => {
            element.classList.add(cls);
        });
    }

    unselect(element) {
        this._scrapingClasses.forEach(cls => {
            element.classList.remove(cls);
        });
    }

    unselectRow(rowData) {
        // TODO
    }

    toggle(element) {
        let wasAdded = true;
        this._scrapingClasses.forEach(cls => {
            wasAdded = element.classList.toggle(cls);
        });
        return wasAdded;
    }

    isSelected(element) {
        let selected = true;
        this._scrapingClasses.forEach(cls => {
            selected = element.classList.contains(cls);
        });
        return selected;
    }

    get classes() {
        return this._scrapingClasses;
    }

    set classes(classList) {
        this._scrapingClasses = classList;
        this._mouseSelector.reset();
    }

    selectingRows() {
        this.classes = ['scraping-selected-row'];
        this.isSelectingRows = true;
    }

    selectingCols() {
        this.classes = [
            'scraping-selected-col',
            `scraping-col-${this._currentCol}`
        ];
        this.isSelectingRows = false;
    }

    changeCol({ colId }) {
        this._currentCol = colId;
        this.selectingCols();
    }

    injectDomNavigation() {
        this._domNavigaton.inject();
    }

    toggleMouseSelector() {
        this._mouseSelector.toggle();
    }

    acceptAutoSelect() {
        this._mouseSelector.acceptAutoSelect();
    }

    rejectAutoSelect() {
        this._mouseSelector.rejectAutoSelect();
    }

    contains(payload) {
        this._textSelector.contains(payload);
    }

    startsWith(payload) {
        this._textSelector.startsWith(payload);
    }

    endsWith(payload) {
        this._textSelector.endsWith(payload);
    }

    notify({ msg }) {
        this._controller.notify({ msg });
    }
}