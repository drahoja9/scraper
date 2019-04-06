import { PreviewTable } from "./previewTable.js";


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

    removeRowFrom(idx) {
        this._controller.unselectRow(this.data.rowsData[idx]);
        this.data.rowsData.splice(idx, 1);
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
            let dataRow = {};
            for (const col of columns) {
                const colData = row.querySelectorAll(`.scraping-col-${col.id}`);
                const dataList = Array.from(colData, this._htmlExtractor);
                dataRow = { ...dataRow, [col.name]: dataList.join('\n') }
            }
            rowsData.push(dataRow);
        }

        this.data = { columnNames, rowsData };
        this.isDataValid = true;
    }
}


class Exporter {
    static get extension() {
        throw Error('Not implemented!');
    }

    static _getFileUrl(blob) {
        return URL.createObjectURL(blob);
    }
}


class JSONExporter extends Exporter {
    static getFileUrl({ rowsData }) {
        const json = JSON.stringify(rowsData, null, 3);
        const blob = new Blob(
            [json],
            { type: 'application/json', endings: 'native' }
        );
        return super._getFileUrl(blob);
    }

    static get extension() {
        return '.json';
    }
}


class CSVExporter extends Exporter {
    static getFileUrl({ columnNames, rowsData }) {
        const header = columnNames
            .map(colName => CSVExporter._escape(colName))
            .join(',') +
            '\n';
        const csv = rowsData.map(row => {
            const rowData = columnNames.map(
                colName => CSVExporter._escape(row[colName])
            );
            return rowData.join(',');
        });
        const blob = new Blob(
            [header + csv.join('\n')],
            { type: 'text/csv', endings: 'native' }
        );
        return super._getFileUrl(blob);
    }

    static get extension() {
        return '.csv';
    }

    static _escape(text) {
        return `"${text.replace(/"/g, '""')}"`
    }
}
