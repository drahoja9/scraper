import { Messages } from '/src/constants.js';
import { registerClickHandler } from '../utils.js';
import { ColumnBtn } from './columnBtn.js';


export class ColumnPool {
    constructor() {
        this.currentColId = 0;
        this._isVisible = false;

        this._wrapper = document.querySelector('.cols-pool-border');
        this._pool = document.querySelector('.cols-pool');
        this._addBtn = this._pool.lastElementChild;
        this._active = this._addColumn();
        this._active.classList.add('active');

        registerClickHandler(this._addBtn, Messages.ADDED_COL, this._addColumn.bind(this));
    }

    toggle() {
        this._isVisible = !this._isVisible;
        this._wrapper.classList.toggle('hidden');
        return this._isVisible;
    }

    getCols() {
        const colBtns = this._pool.children;
        let cols = [];

        for (const colBtn of colBtns) {
            if (colBtn.id === 'add-col-btn') continue;
            cols.push({ name: colBtn.firstChild.innerText, id: colBtn.id });
        }

        return cols;
    }

    _addColumn() {
        const newColBtn = new ColumnBtn(
            this.currentColId++,
            this._pool.childElementCount,
            this._clickHandler.bind(this),
            this._removeColumn.bind(this)
        );
        this._pool.replaceChild(newColBtn, this._addBtn);
        this._pool.appendChild(this._addBtn);
        return newColBtn;
    }

    _removeColumn(event) {
        event.stopImmediatePropagation();
        this._pool.removeChild(event.target.parentElement);
    }

    _clickHandler(event) {
        this._active.classList.remove('active');
        this._active = event.currentTarget;
        this._active.classList.add('active');
    }
}
