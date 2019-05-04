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
    expect(downloadedData).toEqual('[\n' +
        '   {\n' +
        '      "col-1": "123",\n' +
        '      "col-2": "some, random, data,,,"\n' +
        '   },\n' +
        '   {\n' +
        '      "col-1": "456",\n' +
        '      "col-2": "\\"\\"\\"x\\"\\"y\\"z\\"\\"\\"\\""\n' +
        '   },\n' +
        '   {\n' +
        '      "col-1": "789",\n' +
        '      "col-2": "/.,;[]=-09\\\\8765432:\\"|{}?><|}{+_)(*&^%$#@!~>1`<`"\n' +
        '   }\n' +
        ']');
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
    expect(downloadedData).toEqual(
        '"col-1","col-2"\n' +
        '"123","some, random, data,,,"\n' +
        '"456","""""""x""""y""z"""""""""\n' +
        '"789","/.,;[]=-09\\8765432:""|{}?><|}{+_)(*&^%$#@!~>1`<`"'
    );
    done();
});
