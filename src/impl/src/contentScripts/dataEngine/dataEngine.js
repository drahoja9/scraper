import { CSVExporter, JSONExporter } from './exporter.js';


class DataEngineInterface {
    constructor() {
        this.isDataValid = undefined;
    }

    getData(columns) {
        throw Error('Not implemented!');
    }

    export(columns, format) {
        throw Error('Not implemented!');
    }

    removeRow(row) {
        throw Error('Not implemented!');
    }
}


/**
 * Class responsible for extracting the data from selected elements and exporting them to given format.
 */
export class DataEngine extends DataEngineInterface {
    constructor() {
        super();
        this._data = { columnNames: [], rowsData: [] };
        this.isDataValid = false;
        this._exporter = undefined;
    }

    getData(columns) {
        this._checkData(columns);
        return this._data;
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

        const url = this._exporter.getFileUrl(this._data);
        const filename = 'data' + this._exporter.extension;
        return { url, filename };
    }

    removeRow(row) {
        const rowIdx = this._data.rowsData.indexOf(row);
        this._data.rowsData.splice(rowIdx, 1);
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

        this._data = { columnNames, rowsData };
        this.isDataValid = true;
    }
}
