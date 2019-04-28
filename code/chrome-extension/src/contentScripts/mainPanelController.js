import { MAIN_PANEL_PAGE, Messages } from '../constants.js';


class MainPanelControllerInterface {
    handleInitialLoad() {
        throw Error('Not implemented!');
    }

    toggleMainPanel(minimized, onLeft) {
        throw Error('Not implemented!');
    }

    toggleMinMax() {
        throw Error('Not implemented!');
    }

    switchSides() {
        throw Error('Not implemented!');
    }
}


export class MainPanelController extends MainPanelControllerInterface {
    constructor(controller) {
        super();
        this.isInjected = false;
        this.isVisible = false;
        this.iframe = undefined;
        this._minimized = false;
        this._onLeft = false;

        this._controller = controller;
    }

    handleInitialLoad() {
        if (this._minimized) {
            this.toggleMinMax();
            this._controller.notify({ msg: Messages.MINIMIZE_MAXIMIZE });
        }
        if (this._onLeft) {
            this.switchSides();
            this._controller.notify({ msg: Messages.SWITCH_SIDES });
        }
    }

    toggleMainPanel(minimized, onLeft) {
        this._minimized = minimized;
        this._onLeft = onLeft;

        if (this.isVisible) {
            this._hideMainPanel();
        } else if (this.isInjected) {
            this._showMainPanel();
        } else {
            // This happens only once, after the extension browser button 
            // is pressed on given page
            this._injectMainPanel();
            this._controller.injectParts();
        }
    }

    toggleMinMax() {
        this.iframe.classList.toggle('scraping-minimized');
    }

    switchSides() {
        this.iframe.classList.toggle('scraping-left');
        this.iframe.classList.toggle('scraping-right');
    }

    _showMainPanel() {
        if (this.iframe !== undefined) {
            this.iframe.style = 'display: block;';
            this.isVisible = true;
        }
    }

    _hideMainPanel() {
        if (this.iframe !== undefined) {
            this.iframe.style = 'display: none;';
            this.isVisible = false;
        }
    }

    _injectMainPanel() {
        const iframe = document.createElement('iframe');
        iframe.src = chrome.runtime.getURL(MAIN_PANEL_PAGE);
        iframe.className = 'scraping-iframe-panel scraping-right';
        iframe.frameBorder = 0;
        document.body.appendChild(iframe);

        this.isInjected = true;
        this.isVisible = true;
        this.iframe = iframe;

        this.iframe.onload = this.handleInitialLoad.bind(this);
    }
}
