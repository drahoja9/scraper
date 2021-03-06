/**
 * Subclasses of this class should accept rows data (array of objects, each representing a single row of data), create
 * a JavaScript Blob and return its URL.
 */
class Exporter {
    static get extension() {
        throw Error('Not implemented!');
    }

    static getFileUrl({ rowsData }) {
        throw Error('Not implemented!');
    }

    static _getFileUrl(blob) {
        return URL.createObjectURL(blob);
    }
}


export class JSONExporter extends Exporter {
    static getFileUrl({ rowsData }) {
        const withoutIds = rowsData.map(row => {
            delete row.rowId;
            return row;
        });
        const json = JSON.stringify(withoutIds, null, 3);
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


export class CSVExporter extends Exporter {
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
