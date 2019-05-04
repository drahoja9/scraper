import { Messages } from '../constants.js';
import { Communication } from './communication.js';
import { SelectEngine } from './selectEngine/selectEngine.js';
import { DataEngine } from './dataEngine/dataEngine.js';
import { MainPanelController } from './mainPanelController.js';
import { PreviewTable } from './previewTable/previewTable.js';


export class Controller {
    constructor() {
        this._dataEngine = new DataEngine();
        this._previewTable = new PreviewTable(this);
        this._selectEngine = new SelectEngine(this);
        this._mainPanelController = new MainPanelController(this);
        this._communication = new Communication(this);
    }

    async init(shouldBeVisible, minimized, onLeft) {
        return new Promise(async resolve => {
            await this._previewTable.init();
            if (shouldBeVisible) {
                this._mainPanelController.toggleMainPanel(minimized, onLeft);
            }
            resolve();
        });
    }

    async injectParts() {
        this._selectEngine.injectDomNavigation();
        await this._previewTable.inject();
    }

    previewData({ cols }) {
        const { columnNames, rowsData } = this._dataEngine.getData(cols);
        this._previewTable.display(columnNames, rowsData);
    }

    downloadData({ format, cols }) {
        const { url, filename } = this._dataEngine.export(cols, format);
        this._communication.sendMessageToBackground({
            msg: Messages.DOWNLOAD,
            url: url,
            filename: filename
        });
    }

    unselectRow(rowData) {
        this._selectEngine.unselectRow(rowData);
        this._dataEngine.removeRow(rowData);
    }

    invalidateData() {
        this._dataEngine.isDataValid = false;
    }

    notify({ msg }) {
        this._communication.sendMessageToMainPanel({
            msg: msg
        });
    }

    selectingRows() {
        this._selectEngine.selectingRows();
    }

    selectingCols() {
        this._selectEngine.selectingCols();
    }

    changeCol(payload) {
        this._selectEngine.changeCol(payload);
    }

    toggleMouseSelector() {
        this._selectEngine.toggleMouseSelector();
    }

    undo() {
        this._selectEngine.undo();
    }

    redo() {
        this._selectEngine.redo();
    }

    textContains(payload) {
        this._selectEngine.contains(payload);
    }

    textStartsWith(payload) {
        this._selectEngine.startsWith(payload);
    }

    textEndsWith(payload) {
        this._selectEngine.endsWith(payload);
    }

    cssSelect(payload) {
        this._selectEngine.cssSelect(payload);
    }

    cssUnselect() {
        this._selectEngine.cssUnselect();
    }

    get isMainPanelInjected() {
        return this._mainPanelController.isInjected;
    }

    get isMainPanelVisible() {
        return this._mainPanelController.isVisible;
    }

    get mainPanelIframe() {
        return this._mainPanelController.iframe;
    }

    toggleMainPanel(minimized, onLeft) {
        this._mainPanelController.toggleMainPanel(minimized, onLeft);
    }

    switchMainPanelSides() {
        this._mainPanelController.switchSides();
    }

    toggleMainPanelMinMax() {
        this._mainPanelController.toggleMinMax();
    }
}
