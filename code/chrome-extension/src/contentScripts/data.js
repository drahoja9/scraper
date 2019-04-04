import { PreviewTable } from "./previewTable.js";


export class DataProvider {
    constructor(controller) {
        this._data = { columnNames: [], data: [] };
        this._isDataValid = false;
        this._previewTable = new PreviewTable(this);
        this._controller = controller;
    }

    get data() {
        return this._data;
    }

    set data({ columnNames, data }) {
        this._data = { columnNames, data };
    }

    injectPreviewTable() {
        this._previewTable.inject();
    }

    preview(columns) {
        this._checkData(columns);
        this._previewTable.display();
    }

    export() {
        throw Error('Not implemented!');
    }

    removeRowFrom(idx) {
        this._controller.unselectRow(this._data.data[idx]);
        this._data.data.splice(idx, 1);
    }

    _checkData(columns) {
        if (this._isDataValid) return;

        let columnNames = columns.map(col => col.name);
        let data = [];

        const rows = document.querySelectorAll('.scraping-selected-row');
        for (const row of rows) {
            let dataRow = {};
            for (const col of columns) {
                const colData = row.querySelectorAll(`.scraping-col-${col.id}`);
                const dataList = Array.from(colData, node => node.innerText);
                dataRow = { ...dataRow, [col.name]: dataList.join('\n') }
            }
            data.push(dataRow);
        }

        this._data = { columnNames, data };
        this._isDataValid = true;
    }
}