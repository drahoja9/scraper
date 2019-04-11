import { Messages } from '../constants.js';
import { Communication } from './communication.js';
import { SelectEngine } from './selectEngine.js';
import { DataProvider } from './data/dataProvider.js';
import { MainPanel } from './mainPanel.js';


export class Controller {
    constructor(shouldBeVisible, minimized, onLeft) {
        this._dataProvider = new DataProvider(this);
        this._selectEngine = new SelectEngine(this);
        this.communication = new Communication(this, this._selectEngine);
        this._mainPanel = new MainPanel(this, { shouldBeVisible, minimized, onLeft });

        this.communication.init(this._mainPanel);
    }

    injectParts() {
        this._selectEngine.injectDomNavigation();
        this._dataProvider.injectPreviewTable();
    }

    previewData({ cols }) {
        this._dataProvider.preview(cols);
    }

    downloadData({ format, cols }) {
        const { url, filename } = this._dataProvider.export(cols, format);
        this.communication.sendMessageToBackground({
            msg: Messages.DOWNLOAD,
            url: url,
            filename: filename
        });
    }

    unselectRow(rowData) {
        this._selectEngine.unselectRow(rowData);
    }

    invalidateData() {
        this._dataProvider.isDataValid = false;
    }

    notify({ msg }) {
        this.communication.sendMessageToMainPanel({
            msg: msg
        });
    }
}
