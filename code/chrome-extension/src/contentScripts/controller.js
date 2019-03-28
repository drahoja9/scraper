import { Messages, MAIN_PANEL_PAGE } from '../constants.js';


export class Controller {
    constructor(shouldBeVisible, highlighter, textHighlighter, domNavigator) {
        this._isInjected = false;
        this._isVisible = false;
        this._mainPanel = undefined;
        this._highlighter = highlighter;
        this._textHighlighter = textHighlighter;
        this._domNavigator = domNavigator;

        this._communicationWithMainPanel = this._communicationWithMainPanel.bind(this);
        this._highlighter.addListener(this._notify.bind(this));
        this._highlighter.addListener(this._domNavigator.notify.bind(this._domNavigator));

        if (shouldBeVisible) {
            this._toggle();
        }
    }

    listenToBackground() {
        // Communication with backrground.js (something like "backend" of the extension)
        chrome.runtime.onMessage.addListener(
            function (request, sender, sendResponse) {
                if (request.msg === Messages.BROWSER_ACTION_CLICKED) {
                    this._toggle();
                }

                if (
                    request.msg === Messages.TAB_UPDATED &&
                    request.shouldBeVisible === true &&
                    !this._isInjected
                ) {
                    this._toggle();
                }
            }.bind(this)
        );
    }

    _toggle() {
        if (this._isVisible) {
            this._hideMainPanel();
        } else if (this._isInjected) {
            this._showMainPanel();
        } else {
            this._injectMainPanel();
            this._domNavigator.inject();
        }
        this._toggleCommunication();
    }

    _showMainPanel() {
        if (this._mainPanel !== undefined) {
            this._mainPanel.style = 'display: block;';
            this._isVisible = true;
        }
    }

    _hideMainPanel() {
        if (this._mainPanel !== undefined) {
            this._mainPanel.style = 'display: none;';
            this._isVisible = false;
        }
    }

    _injectMainPanel() {
        const iframe = document.createElement('iframe');
        iframe.src = chrome.runtime.getURL(MAIN_PANEL_PAGE);
        iframe.className = 'scraping-iframe-panel';
        iframe.frameBorder = 0;
        document.querySelector('body').appendChild(iframe);

        this._isInjected = true;
        this._isVisible = true;
        this._mainPanel = iframe;
    }

    _communicationWithMainPanel() {
        if (event.data.type !== Messages.FROM_MAIN_PANEL) {
            return;
        }
        switch (event.data.msg) {
            case Messages.SELECT_ELEMENTS:
                this._highlighter.toggle();
                break;
            case Messages.ACCEPT_AUTO_SELECT:
                this._highlighter.acceptAutoSelect();
                break;
            case Messages.REJECT_AUTO_SELECT:
                this._highlighter.rejectAutoSelect();
                break;
            case Messages.TEXT_SEARCH_CONTAINS:
                this._textHighlighter.contains(event.data.payload);
                break;
            case Messages.TEXT_SEARCH_STARTS:
                this._textHighlighter.startsWith(event.data.payload);
                break;
            case Messages.TEXT_SEARCH_ENDS:
                this._textHighlighter.endsWith(event.data.payload);
                break;
            default:
                console.error('Unknown message from main panel!');
        }
    }

    _toggleCommunication() {
        if (this._isVisible) {
            window.addEventListener('message', this._communicationWithMainPanel);
        } else {
            window.removeEventListener('message', this._communicationWithMainPanel);
        }
    }

    _notify({ msg }) {
        this._mainPanel.contentWindow.postMessage(
            { type: Messages.FROM_CONTROLLER, msg: msg },
            chrome.runtime.getURL(MAIN_PANEL_PAGE)
        );
    }
}
