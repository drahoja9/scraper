export class CSSSelector {
    constructor(selectEngine) {
        this._current = undefined;
        this._selectEngine = selectEngine;
    }

    select({ selector }) {
        this._unselectPrevious();
        const toSelect = document.querySelectorAll(selector);
        toSelect.forEach(node => this._selectEngine.select(node));
        this._current = selector;
    }

    _unselectPrevious() {
        if (this._current) {
            const toUnselect = document.querySelectorAll(this._current);
            toUnselect.forEach(node => this._selectEngine.unselect(node));
        }
    }
}