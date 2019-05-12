import { Messages } from '/src/constants.js';
import { ColumnName } from './columnName.js';
import { ColumnNameForm } from './columnNameForm.js';
import { ColumnRemoveBtn } from './columnRemoveBtn.js';
import { registerClickHandler, registerHandler } from '../utils.js';


export class ColumnBtn {
    constructor(id, number, clickHandler, removeColumnHandler) {
        this._node = document.createElement('button');
        this._node.classList.add('col-btn');
        this._node.id = id;

        this._name = new ColumnName(number);
        this._nameForm = new ColumnNameForm(
            this._name.innerText,
            this._rename.bind(this),
            this._displayNameForm.bind(this)
        );
        const removeBtn = new ColumnRemoveBtn(removeColumnHandler);

        registerClickHandler(
            this._node,
            Messages.CHOSEN_COL,
            clickHandler,
            () => ({ colId: this._node.id })
        );
        registerHandler(
            this._node, 'dblclick',
            Messages.RENAMED_COL,
            this._displayNameForm.bind(this)
        );

        this._node.appendChild(this._name);
        this._node.appendChild(this._nameForm);
        this._node.appendChild(removeBtn);

        return this._node;
    }

    _displayNameForm() {
        const nameRect = this._name.getBoundingClientRect();
        this._name.style.display = 'none';
        this._nameForm.style.display = 'block';
        this._nameForm.style.width = `${nameRect.width}px`;
        this._nameForm.style.height = `${nameRect.height}px`;
        this._nameForm.focus();
    }

    _rename(newName) {
        this._name.innerText = newName;
        this._name.style.display = 'block';
        this._nameForm.style.display = 'none';
    }
}
