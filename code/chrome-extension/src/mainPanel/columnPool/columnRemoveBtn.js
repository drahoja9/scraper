import { Messages } from '/src/constants.js';
import { registerClickHandler } from '../utils.js';


export class ColumnRemoveBtn {
    constructor(removeColumnHandler) {
        this._btn = document.createElement('span');
        this._btn.classList.add('col-remove');
        this._btn.innerHTML = '&times;';

        registerClickHandler(this._btn, Messages.REMOVED_COL, removeColumnHandler);

        return this._btn;
    }
}
