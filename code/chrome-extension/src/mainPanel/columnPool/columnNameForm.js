import { ENTER_KEY } from '/src/constants.js';


export class ColumnNameForm {
    constructor(value, renameFunc, displayNameForm) {
        this._form = document.createElement('textarea');
        this._form.classList.add('col-rename');
        this._form.value = value;

        this._form.addEventListener('focusout', (event) => {
            renameFunc(event.currentTarget.value)
        });
        this._form.addEventListener('keydown', (event) => {
            if (event.keyCode === ENTER_KEY) {
                renameFunc(event.currentTarget.value);
            }
        });
        this._form.addEventListener('input', (event) => {
            // Toggling the name and the name form on and off to set the correct width for the form
            renameFunc(event.currentTarget.value);
            displayNameForm();
        });

        return this._form;
    }
}
