import { Messages, MAIN_PANEL_PAGE } from '../constants.js';


export class Communication {
    constructor(controller, selectEngine) {
        this._controller = controller;
        this._selectEngine = selectEngine;

        this._communicationWithMainPanel = this._communicationWithMainPanel.bind(this);
    }

    toggle() {
        if (this._controller.isVisible) {
            window.addEventListener('message', this._communicationWithMainPanel);
        } else {
            window.removeEventListener('message', this._communicationWithMainPanel);
        }
    }

    listenToBackground() {
        // Communication with backrground.js (something like "backend" of the extension)
        chrome.runtime.onMessage.addListener(
            function (request, sender, sendResponse) {
                if (request.msg === Messages.BROWSER_ACTION_CLICKED) {
                    this._controller.toggleMainPannel();
                }

                if (
                    request.msg === Messages.TAB_UPDATED &&
                    request.shouldBeVisible === true &&
                    !this._controller.isInjected
                ) {
                    this._controller.toggleMainPannel();
                }
            }.bind(this)
        );
    }

    sendMessageToMainPanel(msg) {
        this._controller.mainPanel.contentWindow.postMessage(
            { ...msg, type: Messages.FROM_CONTROLLER },
            chrome.runtime.getURL(MAIN_PANEL_PAGE)
        );
    }

    _communicationWithMainPanel(event) {
        if (event.data.type !== Messages.FROM_MAIN_PANEL) {
            return;
        }
        switch (event.data.msg) {
            case Messages.SELECTING_ROWS:
                this._selectEngine.selectingRows();
                break;
            case Messages.SELECTING_COLS:
                this._selectEngine.selectingCols();
                break;
            case Messages.CHOSEN_COL:
                this._selectEngine.changeCol(event.data.payload);
                break;
            case Messages.SELECTING_ELEMENTS:
                this._selectEngine.toggleMouseSelector();
                break;
            case Messages.ACCEPT_AUTO_SELECT:
                this._selectEngine.acceptAutoSelect();
                break;
            case Messages.REJECT_AUTO_SELECT:
                this._selectEngine.rejectAutoSelect();
                break;
            case Messages.TEXT_SEARCH_CONTAINS:
                this._selectEngine.contains(event.data.payload);
                break;
            case Messages.TEXT_SEARCH_STARTS:
                this._selectEngine.startsWith(event.data.payload);
                break;
            case Messages.TEXT_SEARCH_ENDS:
                this._selectEngine.endsWith(event.data.payload);
                break;
            case Messages.ASSEMBLE_PREVIEW:
                const payload = this._controller.downloadData(event.data.payload);
                this.sendMessageToMainPanel({ msg: Messages.DISPLAY_PREVIEW, payload });
                break;
            default:
                console.error('Unknown message from main panel!');
        }
    }
}