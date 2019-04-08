import { MouseSelector } from './mouseSelector.js';
import { TextSelector } from './textSelector.js';
import { DOMNavigaton } from './domNavigation/domNavigation.js';
import { CSSSelector } from './cssSelector.js';
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

    unselect(elements) {
        this._selection.unselect(elements);
    }

    unselectCurrent() {
        this._selection.unselectCurrent();
    }

    unselectRow(rowData) {
        // TODO
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