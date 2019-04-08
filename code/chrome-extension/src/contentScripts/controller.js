import { MAIN_PANEL_PAGE, Messages } from '../constants.js';
import { Communication } from './communication.js';
import { SelectEngine } from './selectors/selectEngine.js';
import { DataProvider } from './data/dataProvider.js';


export class Controller {
    constructor(shouldBeVisible, minimized, onLeft) {
        this.isInjected = false;
        this.isVisible = false;
        this.mainPanel = undefined;

        this._dataProvider = new DataProvider(this);
        this._selectEngine = new SelectEngine(this);
        this._communication = new Communication(this, this._selectEngine);

        this._communication.listenToBackground();
        if (shouldBeVisible) {
            this._minimized = minimized;
            this._onLeft = onLeft;
            this.toggleMainPannel();
        }
    }

    handleInitialLoad() {
        if (this._minimized) {
            this.toggleMinMax();
            this._communication.sendMessageToMainPanel({
                msg: Messages.MINIMIZE_MAXIMIZE
            });
        }
        if (this._onLeft) {
            this.switchSides();
            this._communication.sendMessageToMainPanel({
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
            this._selectEngine.injectDomNavigation();
            this._dataProvider.injectPreviewTable();
        }
        this._communication.toggle();
    }

    toggleMinMax() {
        this.mainPanel.classList.toggle('scraping-minimized');
    }

    switchSides() {
        this.mainPanel.classList.toggle('scraping-left');
        this.mainPanel.classList.toggle('scraping-right');
    }

    previewData({ cols }) {
        this._dataProvider.preview(cols);
    }

    downloadData({ format, cols }) {
        const { url, filename } = this._dataProvider.export(cols, format);
        this._communication.sendMessageToBackground({
            msg: Messages.DOWNLOAD,
            url: url,
            filename: filename
        });
    }

    unselectRow(row) {
        this._selectEngine.unselectRow(row);
    }

    invalidateData() {
        this._dataProvider.isDataValid = false;
    }

    undo() {
        this._selectEngine.unselectCurrent();
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
        iframe.className = 'scraping-iframe-panel scraping-right';
        iframe.frameBorder = 0;
        document.querySelector('body').appendChild(iframe);

        this.isInjected = true;
        this.isVisible = true;
        this.mainPanel = iframe;

        this.mainPanel.onload = this.handleInitialLoad.bind(this);
    }

    notify({ msg }) {
        this._communication.sendMessageToMainPanel({
            msg: msg
        });
    }
}
