import { PreviewTable } from "./previewTable.js";


export class DataProvider {
    constructor(controller) {
        this.data = { columnNames: [], rowsData: [] };
        this._isDataValid = false;
        this._previewTable = new PreviewTable(this);
        this._controller = controller;
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
        this._controller.unselectRow(this.data.data[idx]);
        this.data.rowsData.splice(idx, 1);
    }

    _checkData(columns) {
        if (this._isDataValid) return;

        let columnNames = columns.map(col => col.name);
        let rowsData = [];

        const rows = document.querySelectorAll('.scraping-selected-row');
        for (const row of rows) {
            let dataRow = {};
            for (const col of columns) {
                const colData = row.querySelectorAll(`.scraping-col-${col.id}`);
                const dataList = Array.from(colData, node => node.innerText);
                dataRow = { ...dataRow, [col.name]: dataList.join('\n') }
            }
            rowsData.push(dataRow);
        }

        this.data = { columnNames, rowsData };
        this._isDataValid = true;
    }
}