class CSSSelectorInteface {
    select({ selector }) {
        throw Error('Not implemented!');
    }

    unselectCurrent() {
        throw Error('Not implemented!');
    }
}


export class CSSSelector extends CSSSelectorInteface {
    constructor(selectEngine) {
        super();
        this._selectEngine = selectEngine;
        this._current = undefined;
    }

    select({ selector }) {
        this.unselectCurrent();
        const toSelect = document.querySelectorAll(selector);
        this._selectEngine.select(toSelect);
        this._current = toSelect;
    }

    unselectCurrent() {
        if (this._current) {
            this._selectEngine.unselect(this._current);
            this._current = undefined;
        }
    }
}