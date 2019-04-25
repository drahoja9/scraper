import { Messages } from '../constants.js';
import { Communication } from './communication.js';
import { SelectEngine } from './selectEngine/selectEngine.js';
import { DataEngine } from './dataEngine/dataEngine.js';
import { MainPanelController } from './mainPanelController.js';
import { PreviewTable } from '../previewTable/previewTable.js';


export class Controller {
    constructor(shouldBeVisible, minimized, onLeft) {
        this._dataEngine = new DataEngine();
        this._previewTable = new PreviewTable(this);
        this._selectEngine = new SelectEngine(this);
        this.communication = new Communication(this);
        this._mainPanelController = new MainPanelController(
            this,
            { shouldBeVisible, minimized, onLeft }
        );

        this.communication.init(this._mainPanelController);
    }

    injectParts() {
        this._selectEngine.injectDomNavigation();
        this._previewTable.inject();
    }

    previewData({ cols }) {
        const { columnNames, rowsData } = this._dataEngine.getData(cols);
        this._previewTable.display(columnNames, rowsData);
    }

    downloadData({ format, cols }) {
        const { url, filename } = this._dataEngine.export(cols, format);
        this.communication.sendMessageToBackground({
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
        this.communication.sendMessageToMainPanel({
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
}
