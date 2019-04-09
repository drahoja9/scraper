import { Messages, ENTER_KEY } from '../constants.js';
import { registerClickHandler, registerInputHandler, sendMessageToContentScript, registerHandler } from './utils.js';


export class Selectors {
    constructor() {
        this._mouseSelector = new MouseSelector();
        this._textSelector = new TextSelector();
        this._cssSelector = new CSSSelector();
    }

    switchMouseSelectorColor() {
        this._mouseSelector.switchColor();
    }
}


class MouseSelector {
    constructor() {
        this._selectElementsCheckbox = document.querySelector('#select-elements-checkbox');
        this._selectElementsSwitch = document.querySelector('#select-elements-switch');

        registerClickHandler(
            this._selectElementsCheckbox,
            Messages.SELECTING_ELEMENTS
        );
    }

    switchColor() {
        this._selectElementsSwitch.classList.toggle('switch-row');
        this._selectElementsSwitch.classList.toggle('switch-col');
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
