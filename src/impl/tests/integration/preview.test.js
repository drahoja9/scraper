import { Controller } from "/src/contentScripts/controller.js";
import { DOMWindowSetup } from "./integrationSetup";
import {
    createNewCol,
    displayPreview,
    selectingCols,
    startExtension,
    startMouseSelection,
    switchToCol,
} from "./integrationUtils";
import { _click } from "../utils";


// -------------------------------------------- Setup and teardown ----------------------------------------------

let controller;
let panelDocument;

beforeEach(async function () {
    await DOMWindowSetup();
    controller = new Controller();
    await controller.init(false, false, false);
    panelDocument = await startExtension(controller);
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('display selected data in preview table', async () => {
    const firstPost = document.querySelector('#post-1');
    const secondPost = document.querySelector('#post-2');
    const firstP = document.querySelector('#first-p');
    const secondP = document.querySelector('#second-p');
    const firstImg = document.querySelector('#first-img');
    const secondImg = document.querySelector('#second-img');

    await startMouseSelection(panelDocument);
    _click(firstPost);
    _click(secondPost);
    await selectingCols(panelDocument);
    _click(firstP);
    _click(secondP);
    const colId = await createNewCol(panelDocument, 'Img column');
    await switchToCol(panelDocument, colId);
    _click(firstImg);
    _click(secondImg);

    await displayPreview(panelDocument);
    const previewTable = document.querySelector('#scraping-data-preview');
    const previewTableModal = document.querySelector('.scraping-modal');
    const tableHeader = document.querySelector('.scraping-table-header');
    const tableBody = document.querySelector('.scraping-table-body');

    expect(previewTable).not.toBe(null);
    expect(previewTableModal.style.display).toEqual('flex');
    expect(tableHeader.children.length).toBe(3);
    expect(tableHeader.children[1].innerText).toEqual('Column #1');
    expect(tableHeader.children[2].innerText).toEqual('Img column');
    expect(tableBody.children.length).toBe(2);
    expect(tableBody.children[0].children[0].innerText).toEqual('×');
    expect(tableBody.children[0].children[1].innerText).toEqual(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
        'Suspendisse ornare ipsum vel augue sodales, non dapibus neque sodales. ' +
        'Maecenas cursus sed sem dapibus elementum. ' +
        'Some random latin-like text.'
    );
    expect(tableBody.children[1].children[0].innerText).toEqual('×');
    expect(tableBody.children[1].children[1].innerText).toEqual(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
        'Aenean luctus felis in fringilla convallis. Curabitur ut pharetra ipsum. ' +
        'Some random latin-like text.'
    );
});

test('remove row from preview table', async () => {
    const firstPost = document.querySelector('#post-1');
    const secondPost = document.querySelector('#post-2');
    const firstP = document.querySelector('#first-p');
    const secondP = document.querySelector('#second-p');
    const firstImg = document.querySelector('#first-img');
    const secondImg = document.querySelector('#second-img');

    await startMouseSelection(panelDocument);
    _click(firstPost);
    _click(secondPost);
    await selectingCols(panelDocument);
    _click(firstP);
    _click(secondP);
    const colId = await createNewCol(panelDocument, 'Img column');
    await switchToCol(panelDocument, colId);
    _click(firstImg);
    _click(secondImg);

    await displayPreview(panelDocument);
    const tableBody = document.querySelector('.scraping-table-body');
    _click(tableBody.children[0].children[0].children[0]);

    expect(tableBody.children.length).toBe(1);
    expect(tableBody.children[0].children[0].innerText).toEqual('×');
    expect(tableBody.children[0].children[1].innerText).toEqual(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
        'Aenean luctus felis in fringilla convallis. Curabitur ut pharetra ipsum. ' +
        'Some random latin-like text.'
    );
    expect(firstPost.classList.contains('scraping-selected-row')).toBe(false);
    expect(firstP.classList.contains('scraping-selected-col')).toBe(false);
    expect(firstImg.classList.contains('scraping-selected-col')).toBe(false);
});
