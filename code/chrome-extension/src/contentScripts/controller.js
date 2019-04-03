import { Messages, MAIN_PANEL_PAGE } from '../constants.js';
import { Communication } from './communication.js';
import { SelectEngine } from './selectEngine.js';


export class Controller {
    constructor(shouldBeVisible) {
        this.isInjected = false;
        this.isVisible = false;
        this.mainPanel = undefined;

        this._selectEngine = new SelectEngine(this);
        this._communication = new Communication(this, this._selectEngine);

        this._communication.listenToBackground();
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
            this._selectEngine.injectDomNavigation();
        }
        this._communication.toggle();
    }

    downloadData({ cols }) {
        let columnNames = cols.map(col => col.name);
        let data = [];

        const rows = document.querySelectorAll('.scraping-selected-row');
        for (const row of rows) {
            for (const col of cols) {
                const colData = row.querySelectorAll(`.scraping-col-${col.id}`);
                const dataList = Array.from(colData, node => node.innerText);
                data.push({ [col.name]: dataList.join('\n') });
            }
        }

        return { columnNames, data };
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
            { msg: msg },
        );
    }
}
