import { Messages, ENTER_KEY } from '../constants.js';
import { registerHandler } from './utils.js';


export class ColumnPool {
    constructor() {
        this._wrapper = document.querySelector('.cols-pool-border');
        this._pool = document.querySelector('.cols-pool');
        this._addBtn = this._pool.lastElementChild;
        this._active = this._addColumn();
        this._active.classList.add('active');
        this._isVisible = false;

        registerHandler(this._addBtn, 'click', '', this._addColumn.bind(this));
    }

    toggle() {
        this._isVisible = !this._isVisible;
        this._wrapper.style.display = this._isVisible ? 'block' : 'none';
    }

    _addColumn() {
        const newColBtn = new ColumnButton(
            this._pool.childElementCount,
            this._clickHandler.bind(this),
            this._removeColumn.bind(this)
        ).node;
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


class ColumnButton {
    constructor(number, clickHandler, removeColumnHandler) {
        this._node = document.createElement('button');
        this._node.classList.add('col-btn');

        this._name = new ColumnName(number).name;
        this._nameForm = new ColumnNameForm(
            this._name.innerText,
            this._rename.bind(this),
            this._displayNameForm.bind(this)
        ).form;
        const removeBtn = new ColumnRemoveBtn(removeColumnHandler).btn;

        registerHandler(this.node, 'click', '', clickHandler);
        registerHandler(this.node, 'dblclick', '', this._displayNameForm.bind(this));

        this._node.appendChild(this._name);
        this._node.appendChild(this._nameForm);
        this._node.appendChild(removeBtn);
    }

    get node() {
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


class ColumnName {
    constructor(number) {
        this._name = document.createElement('p');
        this._name.classList.add('col-name');
        this._name.innerText = `Column #${number}`;
    }

    get name() {
        return this._name;
    }
}


class ColumnNameForm {
    constructor(value, renameFunc, displayNameForm) {
        this._form = document.createElement('textarea');
        this._form.classList.add('col-rename');
        this._form.value = value;

        registerHandler(this._form, 'focusout', '', (event) => {
            renameFunc(event.currentTarget.value)
        });
        registerHandler(this._form, 'keydown', '', (event) => {
            if (event.keyCode === ENTER_KEY) {
                renameFunc(event.currentTarget.value);
            }
        });
        registerHandler(this._form, 'input', '', (event) => {
            // Toggling the name and the name form on and off to set the correct width for the form
            renameFunc(event.currentTarget.value);
            displayNameForm();
        });
    }

    get form() {
        return this._form;
    }
}


class ColumnRemoveBtn {
    constructor(removeColumnHandler) {
        this._btn = document.createElement('span');
        this._btn.classList.add('col-remove');
        this._btn.innerHTML = '&times;';

        registerHandler(this._btn, 'click', '', removeColumnHandler);
    }

    get btn() {
        return this._btn;
    }
}
