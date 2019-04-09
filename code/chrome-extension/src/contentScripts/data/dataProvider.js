import { PreviewTable } from "./previewTable/previewTable.js";
import { JSONExporter, CSVExporter } from './exporter.js';


export class DataProvider {
    constructor(controller) {
        this.data = { columnNames: [], rowsData: [] };
        this.isDataValid = false;
        this._previewTable = new PreviewTable(this);
        this._controller = controller;
        this._exporter = undefined;
    }

    injectPreviewTable() {
        this._previewTable.inject();
    }

    preview(columns) {
        this._checkData(columns);
        this._previewTable.display();
    }

    export(columns, format) {
        this._checkData(columns);

        switch (format) {
            case 'json':
                this._exporter = JSONExporter;
                break;
            case 'csv':
                this._exporter = CSVExporter;
                break;
            default:
                throw Error('Unknown export format!');
        }

        const url = this._exporter.getFileUrl(this.data);
        const filename = 'data' + this._exporter.extension;
        return { url, filename };
    }

    removeRow(row) {
        this._controller.unselectRow(row);
        const rowIdx = this.data.rowsData.indexOf(row);
        this.data.rowsData.splice(rowIdx, 1);
    }

    _htmlExtractor(node) {
        if (node.nodeName === 'IMG') {
            return node.src;
        } else {
            return node.innerText;
        }
    }

    _checkData(columns) {
        if (this.isDataValid) return;

        let columnNames = columns.map(col => col.name);
        let rowsData = [];

        const rows = document.querySelectorAll('.scraping-selected-row');
        for (const row of rows) {
            const rowId = row.className.match(/scraping-row-(\d*)/)[1];
            let dataRow = { rowId };
            for (const col of columns) {
                const colData = row.querySelectorAll(`.scraping-col-${col.id}`);
                const dataList = Array.from(colData, this._htmlExtractor);
                dataRow = { ...dataRow, [col.name]: dataList.join('; ') }
            }
            rowsData.push(dataRow);
        }

        this.data = { columnNames, rowsData };
        this.isDataValid = true;
    }
}
