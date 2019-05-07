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

    notifyController(msg) {
        throw Error('Not implemented!');
    }

    invalidateData() {
        throw Error('Not implemented!');
    }

    notifyDOMNavigation(msg) {
        throw Error('Not implemented!');
    }
}


/**
 * Class responsible for all the selecting -- delegates most of the concerns to its child classes. Switches between
 * selecting rows and each of the columns.
 */
export class SelectEngine extends SelectEngineInterface {
    constructor(controller) {
        super();
        this._controller = controller;
        this._mouseSelector = new MouseSelector(this);
        this._textSelector = new TextSelector(this);
        this._domNavigation = new DOMNavigaton(this);
        this._cssSelector = new CSSSelector(this);

        this._currentCol = '0';
        this._rows = new RowSelection(this);
        this._columns = {
            [this._currentCol]: new ColumnSelection(this._currentCol, this)
        };
        this._currentSelection = this._rows;

        this._scrapingId = 'scraping-0';
    }

    get isSelectingRows() {
        return this._currentSelection.isSelectingRows;
    }

    get classes() {
        return this._currentSelection.classes;
    }

    set classes(classList) {
        this._currentSelection.classes = classList;
    }

    select(elements) {
        return this._currentSelection.select(elements);
    }

    unselect(elements) {
        this._currentSelection.unselect(elements);
    }

    unselectRow(rowData) {
        const targetRow = document.querySelector(`.scraping-row-${rowData.rowId}`);
        const targetCols = targetRow.querySelectorAll('.scraping-selected-col');
        const isSelectingRows = this.isSelectingRows;
        const currentCol = this._currentCol;

        this.selectingCols();
        for (const col of targetCols) {
            this.changeCol({ colId: this._currentSelection.getColId(col) });
            this.unselect([col]);
        }

        this.selectingRows();
        this.unselect([targetRow]);

        // Return back to initial state
        this.changeCol({ colId: currentCol });
        isSelectingRows ? this.selectingRows() : this.selectingCols();
    }

    toggle(elements) {
        return this._currentSelection.toggle(elements);
    }

    areSelected(elements) {
        return this._currentSelection.areSelected(elements);
    }

    selectingRows() {
        this._currentSelection = this._rows;
        this._currentSelection.checkUndoRedo();
        this.resetMouseSelector();
    }

    selectingCols() {
        if (!this._columns[this._currentCol]) {
            this._columns[this._currentCol] = new ColumnSelection(this._currentCol, this);
        }
        this._currentSelection = this._columns[this._currentCol];
        this._currentSelection.checkUndoRedo();
        this.resetMouseSelector();
    }

    changeCol({ colId }) {
        this._currentCol = colId;
        this.selectingCols();
        this._currentSelection.activateColumn();
    }

    injectDomNavigation() {
        this._domNavigation.inject();
    }

    toggleMouseSelector() {
        this._mouseSelector.toggle(this._currentSelection.highlightingClass);
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
        this._currentSelection.undo();
    }

    redo() {
        this._currentSelection.redo();
    }

    generateId() {
        const currentId = this._scrapingId.match(/scraping-(\d*)/)[1];
        this._scrapingId = `scraping-${Number(currentId) + 1}`;
        // Generate IDs until it's unique in the whole document
        if (document.querySelector(`#${this._scrapingId}`) !== null) {
            this.generateId();
        }
        return this._scrapingId;
    }

    notifyController(msg) {
        this._controller.notify(msg);
    }

    invalidateData() {
        this._controller.invalidateData();
    }

    notifyDOMNavigation(msg) {
        this._domNavigation.notify(msg);
    }
}
