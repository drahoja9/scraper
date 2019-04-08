import { MAIN_PANEL_PAGE, Messages } from '../constants.js';


export class MainPanel {
    constructor(controller, visibility) {
        this.isInjected = false;
        this.isVisible = false;
        this.iframe = undefined;

        this._controller = controller;

        if (visibility.shouldBeVisible) {
            this._minimized = visibility.minimized;
            this._onLeft = visibility.onLeft;
            this.toggleMainPannel();
        }
    }

    handleInitialLoad() {
        if (this._minimized) {
            this.toggleMinMax();
            this._controller.communication.sendMessageToMainPanel({
                msg: Messages.MINIMIZE_MAXIMIZE
            });
        }
        if (this._onLeft) {
            this.switchSides();
            this._controller.communication.sendMessageToMainPanel({
                msg: Messages.SWITCH_SIDES
            });
        }
    }

    toggleMainPannel() {
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
        this._controller.communication.toggle(this);
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
        document.querySelector('body').appendChild(iframe);

        this.isInjected = true;
        this.isVisible = true;
        this.iframe = iframe;

        this.iframe.onload = this.handleInitialLoad.bind(this);
    }
}
