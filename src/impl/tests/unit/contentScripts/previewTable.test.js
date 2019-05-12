import { PreviewTable } from '/src/contentScripts/previewTable/previewTable.js';
import { ControllerMockup } from '../../mocks.js';
import { DATA_PREVIEW } from "/src/constants.js";
import { prepareTestPage } from "../../setup.js";
import { _click } from "../../utils.js";


// -------------------------------------------- Setup and teardown ----------------------------------------------

let previewTable;
let controller;

beforeEach(async function () {
    await prepareTestPage();
    controller = new ControllerMockup();
    previewTable = new PreviewTable(controller);
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('initialization of preview table', async () => {
    const fs = require('fs');
    const html = fs.readFileSync(chrome.runtime.getURL(DATA_PREVIEW).split('file://')[1]).toString();
    const htmlElement = document.createElement('div');
    htmlElement.innerHTML = html;

    await previewTable.init();
    expect(previewTable._placeholder.innerHTML).toEqual(htmlElement.innerHTML);
    expect(previewTable._modal).not.toBe(undefined);
    expect(previewTable._modal).toBe(previewTable._placeholder.firstElementChild);
});

test('injection of preview table', async () => {
    await previewTable.init();
    previewTable.inject();

    const previewTableDiv = document.querySelector('#scraping-data-preview');
    expect(previewTableDiv).not.toBe(null);
    expect(previewTableDiv).toBe(previewTable._placeholder);
});

test('displaying the preview table', async () => {
    const columnNames = ['col-1', 'col-2', 'col-3'];
    const rowsData = [
        { 'col-1': 'some data', 'col-2': '123', 'col-3': 'example@test.com' },
        { 'col-1': '1@$@#%$%^">', 'col-2': '456', 'col-3': 'gov@io.hu' },
        { 'col-1': '\\\\\\\\\\\\', 'col-2': '789', 'col-3': 'random@email.org' },
    ];
    const getRows = tableBody => Array.from(
        tableBody.children,
        row => Array.from(
            row.children,
            node => node.innerText
        )
    );

    await previewTable.init();
    previewTable.inject();
    const modal = document.querySelector('.scraping-modal');
    const header = document.querySelector('.scraping-table-header');
    const body = document.querySelector('.scraping-table-body');

    previewTable.display(columnNames, rowsData);
    expect(modal.style.display).toEqual('flex');
    expect(header.children.length).toBe(columnNames.length + 1);
    // First column is empty as it is reserved for `remove row` button
    expect(Array.from(header.children).map(node => node.innerText)).toEqual([undefined].concat(columnNames));
    expect(body.children.length).toBe(rowsData.length);

    expect(getRows(body)).toEqual([
        [undefined, 'some data', '123', 'example@test.com'],
        [undefined, '1@$@#%$%^">', '456', 'gov@io.hu'],
        [undefined, '\\\\\\\\\\\\', '789', 'random@email.org']
    ]);
});

test('removing rows from preview table', async () => {
    const columnNames = ['col-1', 'col-2', 'col-3'];
    const rowsData = [
        { 'col-1': 'some data', 'col-2': '123', 'col-3': 'example@test.com' },
        { 'col-1': '1@$@#%$%^">', 'col-2': '456', 'col-3': 'gov@io.hu' },
        { 'col-1': '\\\\\\\\\\\\', 'col-2': '789', 'col-3': 'random@email.org' },
    ];
    const getRows = tableBody => Array.from(
        tableBody.children,
        row => Array.from(
            row.children,
            node => node.innerText
        )
    );

    await previewTable.init();
    previewTable.inject();
    const body = document.querySelector('.scraping-table-body');

    previewTable.display(columnNames, rowsData);
    expect(getRows(body)).toEqual([
        [undefined, 'some data', '123', 'example@test.com'],
        [undefined, '1@$@#%$%^">', '456', 'gov@io.hu'],
        [undefined, '\\\\\\\\\\\\', '789', 'random@email.org']
    ]);

    const deleteBtns = document.querySelectorAll('.scraping-remove-row');

    _click(deleteBtns[1]);
    expect(getRows(body)).toEqual([
        [undefined, 'some data', '123', 'example@test.com'],
        [undefined, '\\\\\\\\\\\\', '789', 'random@email.org']
    ]);
    expect(controller.unselectRow.mock.calls.length).toBe(1);
    expect(controller.unselectRow.mock.calls[0][0]).toEqual(rowsData[1]);

    _click(deleteBtns[0]);
    expect(controller.unselectRow.mock.calls.length).toBe(2);
    expect(controller.unselectRow.mock.calls[1][0]).toEqual(rowsData[0]);

    _click(deleteBtns[2]);
    expect(controller.unselectRow.mock.calls.length).toBe(3);
    expect(controller.unselectRow.mock.calls[2][0]).toEqual(rowsData[2]);

    expect(getRows(body)).toEqual([]);
});

test('closing preview table with close button', async () => {
    const columnNames = ['col-1', 'col-2', 'col-3'];
    const rowsData = [
        { 'col-1': 'some data', 'col-2': '123', 'col-3': 'example@test.com' },
        { 'col-1': '1@$@#%$%^">', 'col-2': '456', 'col-3': 'gov@io.hu' },
        { 'col-1': '\\\\\\\\\\\\', 'col-2': '789', 'col-3': 'random@email.org' },
    ];
    await previewTable.init();
    previewTable.inject();
    previewTable.display(columnNames, rowsData);

    const closeBtn = document.querySelector('.scraping-modal-close');
    _click(closeBtn);

    const modal = document.querySelector('.scraping-modal');
    const header = document.querySelector('.scraping-table-header');
    const body = document.querySelector('.scraping-table-body');
    expect(modal.style.display).toEqual('none');
    expect(header.children.length).toBe(1);
    expect(body.children.length).toBe(0);
});

test('closing preview table by clicking away', async () => {
    const columnNames = ['col-1', 'col-2', 'col-3'];
    const rowsData = [
        { 'col-1': 'some data', 'col-2': '123', 'col-3': 'example@test.com' },
        { 'col-1': '1@$@#%$%^">', 'col-2': '456', 'col-3': 'gov@io.hu' },
        { 'col-1': '\\\\\\\\\\\\', 'col-2': '789', 'col-3': 'random@email.org' },
    ];
    await previewTable.init();
    previewTable.inject();
    previewTable.display(columnNames, rowsData);

    const modal = document.querySelector('.scraping-modal');
    const header = document.querySelector('.scraping-table-header');
    const body = document.querySelector('.scraping-table-body');
    _click(modal);
    expect(modal.style.display).toEqual('none');
    expect(header.children.length).toBe(1);
    expect(body.children.length).toBe(0);
});
