import { Messages, ENTER_KEY } from '../constants.js';
import { registerClickHandler, registerInputHandler, sendMessageToContentScript } from './utils.js';


export function toggleAutoselectConfirmation({ shouldEnable }) {
    const alert = document.querySelector('#auto-select-alert');
    const acceptAutoSelectBtn = document.querySelector('#accept-auto-select');
    const rejectAutoSelectBtn = document.querySelector('#reject-auto-select');

    if (shouldEnable !== undefined) {
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


export class Selectors {
    constructor() {
        this._mouseSelector = new MouseSelector();
        this._textSelector = new TextSelector();
        this._cssSelector = new CSSSelector();
    }
}


class MouseSelector {
    constructor() {
        this._selectElementsBtn = document.querySelector('#select-elements-btn');
        this._acceptAutoSelectBtn = document.querySelector('#accept-auto-select');
        this._rejectAutoSelectBtn = document.querySelector('#reject-auto-select');

        registerClickHandler(
            this._selectElementsBtn,
            Messages.SELECTING_ELEMENTS,
            () => { this._selectElementsBtn.classList.toggle('toggled-btn'); }
        );
        registerClickHandler(
            this._acceptAutoSelectBtn,
            Messages.ACCEPT_AUTO_SELECT,
            toggleAutoselectConfirmation
        );
        registerClickHandler(
            this._rejectAutoSelectBtn,
            Messages.REJECT_AUTO_SELECT,
            toggleAutoselectConfirmation
        );
    }
}


class TextSelector {
    constructor() {
        this._textSearchContainsInput = document.querySelector('#text-search-contains');
        this._containsExactCheck = document.querySelector('#contains-exact');
        this._textSearchStartsInput = document.querySelector('#text-search-starts');
        this._textSearchEndsInput = document.querySelector('#text-search-ends');

        registerInputHandler(
            this._textSearchContainsInput,
            Messages.TEXT_SEARCH_CONTAINS,
            this._containsExactCheck
        );
        registerInputHandler(
            this._textSearchStartsInput,
            Messages.TEXT_SEARCH_STARTS
        );
        registerInputHandler(
            this._textSearchEndsInput,
            Messages.TEXT_SEARCH_ENDS
        );
    }
}


class CSSSelector {
    constructor() {
        this._cssSelectorInput = document.querySelector('#css-input');
        this._error = document.querySelector('#css-form-error');
        this._cssSelectorInput.addEventListener('keydown', this._inputHandler.bind(this));
    }

    _inputHandler(event) {
        if (event.keyCode === ENTER_KEY) {
            event.preventDefault();
            const selector = this._cssSelectorInput.value;

            if (selector === '') {
                this._cssSelectorInput.classList.remove('invalid');
                sendMessageToContentScript(Messages.CSS_UNSELECT);
            } else if (!this._validate(selector)) {
                this._cssSelectorInput.classList.add('invalid');
            } else {
                this._cssSelectorInput.classList.remove('invalid');
                sendMessageToContentScript(Messages.CSS_SELECT, {
                    selector: selector,
                });
            }
        }
    }

    _validate(selector) {
        try {
            document.querySelector(selector);
        } catch (DOMException) {
            return false;
        }
        return true;
    }
}
