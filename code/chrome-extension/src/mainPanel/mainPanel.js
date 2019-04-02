import { Messages } from '../constants.js';
import { ColumnPool } from './columnPool.js';
import { registerHandler, registerInputHandler } from './utils.js';


function toggleAutoselectConfirmation(shouldEnable = null) {
    const alert = document.querySelector('#auto-select-alert');
    const acceptAutoSelectBtn = document.querySelector('#accept-auto-select');
    const rejectAutoSelectBtn = document.querySelector('#reject-auto-select');

    if (shouldEnable !== null) {
        acceptAutoSelectBtn.disabled = !shouldEnable;
        rejectAutoSelectBtn.disabled = !shouldEnable;
        if (shouldEnable) {
            alert.classList.add('show');
        } else {
            alert.classList.remove('show');
        }
    } else if (acceptAutoSelectBtn.disabled) {
        acceptAutoSelectBtn.disabled = false;
        rejectAutoSelectBtn.disabled = false;
        alert.classList.add('show');
    } else {
        acceptAutoSelectBtn.disabled = true;
        rejectAutoSelectBtn.disabled = true;
        alert.classList.remove('show');
    }
}


class RowsColsSwitcher {
    constructor(colsPool) {
        const rowsBtn = document.querySelector('#rows-btn');
        const colsBtn = document.querySelector('#cols-btn');
        this._colsPool = colsPool;
        this._active = rowsBtn;

        registerHandler(rowsBtn, 'click', '', this._switch.bind(this));
        registerHandler(colsBtn, 'click', '', this._switch.bind(this));
    }

    _switch(event) {
        if (event.currentTarget === this._active) return;

        this._active.classList.remove('active');
        this._active = event.currentTarget;
        this._active.classList.add('active');

        this._colsPool.toggle();
    }
}


// ========================================================================================================


$(function () {
    const selectElementsBtn = document.querySelector('#select-elements-btn');

    const acceptAutoSelectBtn = document.querySelector('#accept-auto-select');
    const rejectAutoSelectBtn = document.querySelector('#reject-auto-select');

    const textSearchContainsInput = document.querySelector('#text-search-contains');
    const containsExactCheck = document.querySelector('#contains-exact');
    const textSearchStartsInput = document.querySelector('#text-search-starts');
    const textSearchEndsInput = document.querySelector('#text-search-ends');

    const colsPool = new ColumnPool();
    const switcher = new RowsColsSwitcher(colsPool);

    toggleAutoselectConfirmation();

    registerHandler(selectElementsBtn, 'click', Messages.SELECT_ELEMENTS, () => { selectElementsBtn.classList.toggle('toggled-btn'); })
    registerHandler(acceptAutoSelectBtn, 'click', Messages.ACCEPT_AUTO_SELECT, toggleAutoselectConfirmation)
    registerHandler(rejectAutoSelectBtn, 'click', Messages.REJECT_AUTO_SELECT, toggleAutoselectConfirmation)
    registerInputHandler(
        textSearchContainsInput,
        Messages.TEXT_SEARCH_CONTAINS,
        containsExactCheck
    );
    registerInputHandler(
        textSearchStartsInput,
        Messages.TEXT_SEARCH_STARTS
    );
    registerInputHandler(
        textSearchEndsInput,
        Messages.TEXT_SEARCH_ENDS
    );

    window.addEventListener('message', (event) => {
        if (event.data.type !== Messages.FROM_CONTROLLER) {
            return;
        }
        switch (event.data.msg) {
            case Messages.DECIDE_AUTO_SELECT:
                toggleAutoselectConfirmation(true);
                break;
        }
    });
});