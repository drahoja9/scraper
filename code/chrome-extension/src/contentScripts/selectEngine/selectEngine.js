import { MouseSelector } from './selectors/mouseSelector.js';
import { TextSelector } from './selectors/textSelector.js';
import { DOMNavigaton } from './selectors/domNavigation/domNavigation.js';
import { CSSSelector } from './selectors/cssSelector.js';
import { ColumnSelection, RowSelection } from './selection.js';


class SelectEngineInterface {
    get isSelectingRows() {
        throw Error('Not implemented!');
    }

    get classes() {
        throw Error('Not implemented!');
    }

    set classes(classList) {
        throw Error('Not implemented!');
    }

    select(elements) {
        throw Error('Not implemented!');
    }

    unselect(elements) {
        throw Error('Not implemented!');
    }

    unselectRow(rowData) {
        throw Error('Not implemented!');
    }

    toggle(elements) {
        throw Error('Not implemented!');
    }

    areSelected(elemnets) {
        throw Error('Not implemented!');
    }

    selectingRows() {
        throw Error('Not implemented!');
    }

    selectingCols() {
        throw Error('Not implemented!');
    }

    changeCol({ colId }) {
        throw Error('Not implemented!');
    }

    injectDomNavigation() {
        throw Error('Not implemented!');
    }

    toggleMouseSelector() {
        throw Error('Not implemented!');
    }

    contains(payload) {
        throw Error('Not implemented!');
    }

    startsWith(payload) {
        throw Error('Not implemented!');
    }

    endsWith(payload) {
        throw Error('Not implemented!');
    }

    cssSelect(payload) {
        throw Error('Not implemented!');
    }

    cssUnselect() {
        throw Error('Not implemented!');
    }

    resetMouseSelector() {
        throw Error('Not implemented!');
    }

    undo() {
        throw Error('Not implemented!');
    }

    redo() {
        throw Error('Not implemented!');
    }

    generateId() {
        throw Error('Not implemented!');
    }
}


export class SelectEngine extends SelectEngineInterface {
    constructor(controller) {
        super();
        this._controller = controller;
        this._mouseSelector = new MouseSelector(this);
        this._textSelector = new TextSelector(this);
        this._domNavigation = new DOMNavigaton(this);
        this._cssSelector = new CSSSelector(this);

        this._currentCol = 0;
        this._rows = new RowSelection(this._controller, this._domNavigation, this);
        this._columns = {
            [this._currentCol]: new ColumnSelection(
                this._controller,
                this._domNavigation,
                this._currentCol,
                this
            )
        };
        this._selection = this._rows;

        this._scrapingId = 'scraping-0';
    }

    select(elements) {
        this._selection.select(elements);
    }

    unselect(elements) {
        this._selection.unselect(elements);
    }

    unselectRow(rowData) {
        const targetRow = document.querySelector(`.scraping-row-${rowData.rowId}`);
        const targetCols = targetRow.querySelectorAll('.scraping-selected-col');
        const isSelectingRows = this.isSelectingRows;
        const currentCol = this._currentCol;

        this.selectingCols();
        for (const col of targetCols) {
            this.changeCol({ colId: this._selection.getColId(col) });
            this.unselect([col]);
        }

        this.selectingRows();
        this.unselect([targetRow]);

        // Return back to initial state
        this.changeCol({ colId: currentCol });
        isSelectingRows ? this.selectingRows() : this.selectingCols();
    }

    toggle(elements) {
        return this._selection.toggle(elements);
    }

    areSelected(elements) {
        return this._selection.areSelected(elements);
    }

    get isSelectingRows() {
        return this._selection.isSelectingRows;
    }

    get classes() {
        return this._selection.classes;
    }

    set classes(classList) {
        this._selection.classes = classList;
    }

    selectingRows() {
        this._selection = this._rows;
        this._selection.checkUndoRedo();
        this.resetMouseSelector();
    }

    selectingCols() {
        if (!this._columns[this._currentCol]) {
            this._columns[this._currentCol] = new ColumnSelection(
                this._controller,
                this._domNavigation,
                this._currentCol,
                this
            );
        }
        this._selection = this._columns[this._currentCol];
        this._selection.checkUndoRedo();
        this.resetMouseSelector();
    }

    changeCol({ colId }) {
        this._currentCol = colId;
        this.selectingCols();
        this._selection.activateColumn();
    }

    injectDomNavigation() {
        this._domNavigation.inject();
    }

    toggleMouseSelector() {
        this._mouseSelector.toggle(this._selection.highlightingClass);
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

    cssSelect(payload) {
        this._cssSelector.select(payload);
    }

    cssUnselect() {
        this._cssSelector.unselectCurrent();
    }

    resetMouseSelector() {
        this._mouseSelector.reset();
        this.toggleMouseSelector();
        this.toggleMouseSelector();
    }

    undo() {
        this._selection.undo();
    }

    redo() {
        this._selection.redo();
    }

    generateId() {
        const currentId = this._scrapingId.match(/scraping-(\d*)/)[1];
        this._scrapingId = `scraping-${Number(currentId) + 1}`;
        return this._scrapingId;
    }
}