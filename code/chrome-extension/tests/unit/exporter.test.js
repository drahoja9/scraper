import { CSVExporter, JSONExporter } from "/src/contentScripts/dataEngine/exporter.js";


// ------------------------------------------------- Helpers ----------------------------------------------------

function readBlobContents(blob) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.addEventListener("loadend", function () {
            resolve(reader.result);
        });
        reader.readAsText(blob);
    });
}

global.URL.createObjectURL = jest.fn(readBlobContents);

// -------------------------------------------------- Tests -----------------------------------------------------


test('export to JSON', async done => {
    const rowsData = [
        { rowId: 1, 'col-1': '123', 'col-2': 'some, random, data,,,' },
        { rowId: 2, 'col-1': '456', 'col-2': '"""x""y"z""""' },
        { rowId: 3, 'col-1': '789', 'col-2': '/.,;[]=-09\\8765432:"|{}?><|}{+_)(*&^%$#@!~>1`<`' }
    ];

    const downloadedData = await JSONExporter.getFileUrl({ rowsData });
    const rowsWithoutIds = rowsData.map(row => {
        const { rowId, ...rest } = row;
        return rest;
    });
    expect(downloadedData).toEqual(JSON.stringify(rowsWithoutIds, null, 3));
    done();
});

test('export to CSV', async done => {
    const rowsData = [
        { rowId: 1, 'col-1': '123', 'col-2': 'some, random, data,,,' },
        { rowId: 2, 'col-1': '456', 'col-2': '"""x""y"z""""' },
        { rowId: 3, 'col-1': '789', 'col-2': '/.,;[]=-09\\8765432:"|{}?><|}{+_)(*&^%$#@!~>1`<`' }
    ];
    const columnNames = ['col-1', 'col-2'];

    const downloadedData = await CSVExporter.getFileUrl({ rowsData, columnNames });
    const rowsWithoutIds = rowsData.map(row => {
        const { rowId, ...rest } = row;
        return rest;
    });
    const header = columnNames.map(colName => `"${colName}"`).join(',');
    const data = rowsWithoutIds
        .map(row => {
            row['col-2'] = row['col-2'].replace(/"/g, '""');
            return row;
        })
        .map(row => `"${row['col-1']}","${row['col-2']}"`).join('\n');
    expect(downloadedData).toEqual(header + '\n' + data);
    done();
});
