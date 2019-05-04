import { MAIN_PANEL_PAGE, Messages } from '../constants.js';


class CommunicationInterface {
    listenToMainPanel() {
        throw Error('Not implemented!');
    }

    listenToBackground() {
        throw Error('Not implemented!');
    }

    sendMessageToBackground() {
        throw Error('Not implemented!');
    }

    sendMessageToMainPanel() {
        throw Error('Not implemented!');
    }
}


export class Communication extends CommunicationInterface {
    constructor(controller) {
        super();
        this._controller = controller;

        this._backgroundHandler = this._backgroundHandler.bind(this);
        this._mainPanelHandler = this._mainPanelHandler.bind(this);

        this.listenToBackground();
        this.listenToMainPanel();
    }

    listenToMainPanel() {
        window.addEventListener('message', this._mainPanelHandler);
    }

    listenToBackground() {
        // Communication with backrground.js (something like "backend" of the extension)
        chrome.runtime.onMessage.addListener(this._backgroundHandler);
    }

    sendMessageToBackground(msg) {
        chrome.runtime.sendMessage(msg);
    }

    sendMessageToMainPanel(msg) {
        this._controller.mainPanelIframe.contentWindow.postMessage(
            { ...msg, type: Messages.FROM_CONTROLLER },
            chrome.runtime.getURL(MAIN_PANEL_PAGE)
        );
    }

    _backgroundHandler(request, sender, sendResponse) {
        const extensionIconClicked = request => request.msg === Messages.BROWSER_ACTION_CLICKED;
        const pageUpdatedWithExtensionOn = request => (
            request.msg === Messages.TAB_UPDATED &&
            request.shouldBeVisible === true &&
            !this._controller.isMainPanelInjected
        );

        if (extensionIconClicked(request) || pageUpdatedWithExtensionOn(request)) {
            this._controller.toggleMainPanel(request.minimized, request.onLeft);
        }
    }

    _mainPanelHandler(event) {
        console.log('XXX');
        // Message is not from our main panel
        if (chrome.runtime.getURL(MAIN_PANEL_PAGE).indexOf(event.origin) === -1) {
            return;
        }

        switch (event.data.msg) {
            case Messages.MINIMIZE_MAXIMIZE:
                this._controller.toggleMainPanelMinMax();
                this.sendMessageToBackground({ msg: event.data.msg });
                break;
            case Messages.SWITCH_SIDES:
                this._controller.switchMainPanelSides();
                this.sendMessageToBackground({ msg: event.data.msg });
                break;
            case Messages.SELECTING_ROWS:
                this._controller.selectingRows();
                break;
            case Messages.SELECTING_COLS:
                this._controller.selectingCols();
                break;
            case Messages.ADDED_COL:
            case Messages.RENAMED_COL:
            case Messages.REMOVED_COL:
                this._controller.invalidateData();
                break;
            case Messages.CHOSEN_COL:
                this._controller.changeCol(event.data.payload);
                break;
            case Messages.SELECTING_ELEMENTS:
                this._controller.toggleMouseSelector();
                break;
            case Messages.UNDO:
                this._controller.undo();
                break;
            case Messages.REDO:
                this._controller.redo();
                break;
            case Messages.TEXT_SEARCH_CONTAINS:
                this._controller.textContains(event.data.payload);
                break;
            case Messages.TEXT_SEARCH_STARTS:
                this._controller.textStartsWith(event.data.payload);
                break;
            case Messages.TEXT_SEARCH_ENDS:
                this._controller.textEndsWith(event.data.payload);
                break;
            case Messages.CSS_SELECT:
                this._controller.cssSelect(event.data.payload);
                break;
            case Messages.CSS_UNSELECT:
                this._controller.cssUnselect();
                break;
            case Messages.DISPLAY_PREVIEW:
                this._controller.previewData(event.data.payload);
                break;
            case Messages.DOWNLOAD:
                this._controller.downloadData(event.data.payload);
                break;
            default:
                console.error('Unknown message from main panel!');
        }
    }
}