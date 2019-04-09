import { MouseSelector } from './selectors/mouseSelector.js';
import { TextSelector } from './selectors/textSelector.js';
import { DOMNavigaton } from './selectors/domNavigation/domNavigation.js';
import { CSSSelector } from './selectors/cssSelector.js';
import { RowSelection, ColumnSelection } from './selection.js';


export class SelectEngine {
    constructor(controller) {
        this._controller = controller;
        this._mouseSelector = new MouseSelector(this);
        this._textSelector = new TextSelector(this);
        this._domNavigaton = new DOMNavigaton(this);
        this._cssSelector = new CSSSelector(this);

        this._currentCol = 0;
        this._rows = new RowSelection(controller, this._domNavigaton);
        this._columns = {
            [this._currentCol]: new ColumnSelection(
                controller,
                this._domNavigaton,
                this._currentCol
            )
        };
        this._selection = this._rows;
    }

    select(elements) {
        this._selection.select(elements);
    }

    unselect(elements, all) {
        this._selection.unselect(elements, all);
    }

    unselectCurrent() {
        this._selection.unselectCurrent();
    }

    unselectRow(rowData) {
        const targetRow = document.querySelector(`.scraping-row-${rowData.rowId}`);
        const targetCols = targetRow.querySelectorAll('.scraping-selected-col');
        const isSelectingRows = this.isSelectingRows;

        this.selectingCols();
        this.unselect(targetCols, true);

        this.selectingRows();
        this.unselect([targetRow], true);

        // Return back to initial state
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
        this.resetMouseSelector();
    }

    selectingCols() {
        if (!this._columns[this._currentCol]) {
            this._columns[this._currentCol] = new ColumnSelection(
                this._controller,
                this._domNavigaton,
                this._currentCol
            );
        }
        this._selection = this._columns[this._currentCol];
        this.resetMouseSelector();
    }

    changeCol({ colId }) {
        this._currentCol = colId;
        this.selectingCols();
        this._selection.activateColumn();
    }

    injectDomNavigation() {
        this._domNavigaton.inject();
    }

    toggleMouseSelector() {
        this._mouseSelector.toggle();
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
    }
}