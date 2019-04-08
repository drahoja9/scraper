class Exporter {
    static get extension() {
        throw Error('Not implemented!');
    }

    static _getFileUrl(blob) {
        return URL.createObjectURL(blob);
    }
}


export class JSONExporter extends Exporter {
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
