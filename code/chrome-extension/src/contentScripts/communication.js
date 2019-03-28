import { Messages, MAIN_PANEL_PAGE } from '../constants.js';


export class Communication {
    constructor(controller) {
        this._controller = controller;

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
            msg,
            chrome.runtime.getURL(MAIN_PANEL_PAGE)
        );
    }

    _communicationWithMainPanel(event) {
        if (event.data.type !== Messages.FROM_MAIN_PANEL) {
            return;
        }
        switch (event.data.msg) {
            case Messages.SELECT_ELEMENTS:
                this._controller.mouseSelector.toggle();
                break;
            case Messages.ACCEPT_AUTO_SELECT:
                this._controller.mouseSelector.acceptAutoSelect();
                break;
            case Messages.REJECT_AUTO_SELECT:
                this._controller.mouseSelector.rejectAutoSelect();
                break;
            case Messages.TEXT_SEARCH_CONTAINS:
                this._controller.textSelector.contains(event.data.payload);
                break;
            case Messages.TEXT_SEARCH_STARTS:
                this._controller.textSelector.startsWith(event.data.payload);
                break;
            case Messages.TEXT_SEARCH_ENDS:
                this._controller.textSelector.endsWith(event.data.payload);
                break;
            default:
                console.error('Unknown message from main panel!');
        }
    }
}