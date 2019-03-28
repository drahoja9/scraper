import { Messages, MAIN_PANEL_PAGE } from '../constants.js';
import { Communication } from './communication.js';
import { MouseSelector } from './mouseSelector.js';
import { TextSelector } from './textSelector.js';
import { DOMNavigaton } from './domNavigation.js';


export class Controller {
    constructor(shouldBeVisible) {
        this.isInjected = false;
        this.isVisible = false;
        this.mainPanel = undefined;

        this._communication = new Communication(this);
        this.mouseSelector = new MouseSelector();
        this.textSelector = new TextSelector();
        this.domNavigaton = new DOMNavigaton();

        this._communication.listenToBackground();
        this.mouseSelector.addObserver(this);
        this.mouseSelector.addObserver(this.domNavigaton);
        if (shouldBeVisible) {
            this.toggleMainPannel();
        }
    }

    toggleMainPannel() {
        if (this.isVisible) {
            this._hideMainPanel();
        } else if (this.isInjected) {
            this._showMainPanel();
        } else {
            this._injectMainPanel();
            this.domNavigaton.inject();
        }
        this._communication.toggle();
    }

    _showMainPanel() {
        if (this.mainPanel !== undefined) {
            this.mainPanel.style = 'display: block;';
            this.isVisible = true;
        }
    }

    _hideMainPanel() {
        if (this.mainPanel !== undefined) {
            this.mainPanel.style = 'display: none;';
            this.isVisible = false;
        }
    }

    _injectMainPanel() {
        const iframe = document.createElement('iframe');
        iframe.src = chrome.runtime.getURL(MAIN_PANEL_PAGE);
        iframe.className = 'scraping-iframe-panel';
        iframe.frameBorder = 0;
        document.querySelector('body').appendChild(iframe);

        this.isInjected = true;
        this.isVisible = true;
        this.mainPanel = iframe;
    }

    notify({ msg }) {
        this._communication.sendMessageToMainPanel(
            { type: Messages.FROM_CONTROLLER, msg: msg },
        );
    }
}
