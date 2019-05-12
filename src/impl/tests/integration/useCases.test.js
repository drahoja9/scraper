import { Controller } from "/src/contentScripts/controller.js";
import { DOMWindowSetup } from "./integrationSetup.js";
import {
    createNewCol,
    cssSelect,
    displayPreview,
    firstChildElement,
    nextSiblingElement,
    parentElement,
    previousSiblingElement,
    redo,
    removeRowFromPreview,
    renameCol,
    selectingCols,
    startExtension,
    startMouseSelection,
    switchToCol,
    textSelectContains,
    textSelectStartsWith,
    undo
} from "./integrationUtils.js";
import { _click, _clickWithCtrl } from "../utils.js";


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

test('use case #1', async () => {
    const allTableRows = Array.from(document.querySelectorAll('tr:not(.scraping-protected)'));
    const firstRow = allTableRows[0];
    const secondRow = allTableRows[1];
    await startMouseSelection(panelDocument);

    _click(firstRow);
    expect(firstRow.classList.contains('scraping-selected-row')).toBe(true);
    expect(firstRow.classList.contains('scraping-row-0')).toBe(true);

    _clickWithCtrl(secondRow);
    expect(secondRow.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondRow.classList.contains('scraping-row-1')).toBe(true);

    for (let i = 0; i < allTableRows.length; i++) {
        expect(allTableRows[i].classList.contains('scraping-selected-row')).toBe(true);
        expect(allTableRows[i].classList.contains(`scraping-row-${i}`)).toBe(true);
    }
});

test('use case #2', async () => {
    const allEmails = Array.from(document.querySelectorAll('.email'));
    await textSelectContains(panelDocument, '@');
    for (let i = 0; i > allEmails.length; i++) {
        expect(allEmails[i].classList.contains('scraping-selected-row')).toBe(true);
        // Text search goes in opposite direction than `document.querySelectorAll`
        expect(allEmails[i].classList.contains(`scraping-row-${allEmails.length - i - 1}`)).toBe(true);
    }
});

test('use case #3', async () => {
    const allPins = Array.from(document.querySelectorAll('.personal-identification-number'));
    const oscar = allPins[5];
    const stanley = allPins[6];
    await textSelectStartsWith(panelDocument, '58');
    expect(oscar.classList.contains('scraping-selected-row')).toBe(true);
    expect(oscar.classList.contains('scraping-row-1')).toBe(true);
    expect(stanley.classList.contains('scraping-selected-row')).toBe(true);
    expect(stanley.classList.contains('scraping-row-0')).toBe(true);
});

test('use case #4', async () => {
    const firstImg = document.querySelector('#first-img');
    const secondImg = document.querySelector('#second-img');
    await cssSelect(panelDocument, 'img');
    expect(firstImg.classList.contains('scraping-selected-row')).toBe(true);
    expect(firstImg.classList.contains('scraping-row-0')).toBe(true);
    expect(secondImg.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondImg.classList.contains('scraping-row-1')).toBe(true);
});

test('use case #5', async () => {
    const bestMovies = Array.from(document.querySelectorAll('.movie:first-of-type'));
    await cssSelect(panelDocument, '.movie:first-of-type');
    for (let i = 0; i < bestMovies.length; i++) {
        expect(bestMovies[i].classList.contains('scraping-selected-row')).toBe(true);
        expect(bestMovies[i].classList.contains(`scraping-row-${i}`)).toBe(true);
    }
});

test('use case #6', async () => {
    const firstImgDiv = document.querySelector('#first-img-div');
    const firstContentDiv = document.querySelector('#first-content-div');
    const firstPost = document.querySelector('#post-1');

    await startMouseSelection(panelDocument);
    _click(firstContentDiv);
    expect(firstContentDiv.classList.contains('scraping-selected-row')).toBe(true);
    expect(firstPost.classList.contains('scraping-selected-row')).toBe(false);
    expect(firstImgDiv.classList.contains('scraping-selected-row')).toBe(false);

    await parentElement(firstContentDiv);
    expect(firstContentDiv.classList.contains('scraping-selected-row')).toBe(false);
    expect(firstPost.classList.contains('scraping-selected-row')).toBe(true);
    expect(firstImgDiv.classList.contains('scraping-selected-row')).toBe(false);

    await firstChildElement(firstPost);
    expect(firstContentDiv.classList.contains('scraping-selected-row')).toBe(false);
    expect(firstPost.classList.contains('scraping-selected-row')).toBe(false);
    expect(firstImgDiv.classList.contains('scraping-selected-row')).toBe(true);

    await nextSiblingElement(firstImgDiv);
    expect(firstContentDiv.classList.contains('scraping-selected-row')).toBe(true);
    expect(firstPost.classList.contains('scraping-selected-row')).toBe(false);
    expect(firstImgDiv.classList.contains('scraping-selected-row')).toBe(false);

    await previousSiblingElement(firstContentDiv);
    expect(firstContentDiv.classList.contains('scraping-selected-row')).toBe(false);
    expect(firstPost.classList.contains('scraping-selected-row')).toBe(false);
    expect(firstImgDiv.classList.contains('scraping-selected-row')).toBe(true);
});

test('use case #7', async () => {
    const container = document.querySelector('#container');
    const firstImg = document.querySelector('#first-img');
    await startMouseSelection(panelDocument);

    _click(container);
    _click(firstImg);
    expect(container.classList.contains('scraping-selected-row')).toBe(true);
    expect(firstImg.classList.contains('scraping-selected-row')).toBe(true);

    _click(container);
    expect(container.classList.contains('scraping-selected-row')).toBe(false);
    expect(firstImg.classList.contains('scraping-selected-row')).toBe(true);

    await undo(panelDocument);
    expect(container.classList.contains('scraping-selected-row')).toBe(true);
    expect(firstImg.classList.contains('scraping-selected-row')).toBe(true);

    await undo(panelDocument);
    expect(container.classList.contains('scraping-selected-row')).toBe(true);
    expect(firstImg.classList.contains('scraping-selected-row')).toBe(false);

    await undo(panelDocument);
    expect(container.classList.contains('scraping-selected-row')).toBe(false);
    expect(firstImg.classList.contains('scraping-selected-row')).toBe(false);

    await redo(panelDocument);
    expect(container.classList.contains('scraping-selected-row')).toBe(true);
    expect(firstImg.classList.contains('scraping-selected-row')).toBe(false);

    await redo(panelDocument);
    expect(container.classList.contains('scraping-selected-row')).toBe(true);
    expect(firstImg.classList.contains('scraping-selected-row')).toBe(true);

    await redo(panelDocument);
    expect(container.classList.contains('scraping-selected-row')).toBe(false);
    expect(firstImg.classList.contains('scraping-selected-row')).toBe(true);
});

test('use case #8', async () => {
    const tableRows = Array.from(document.querySelectorAll('.table-row'));
    const names = Array.from(document.querySelectorAll('.name'));
    const emails = Array.from(document.querySelectorAll('.email'));
    const positions = Array.from(document.querySelectorAll('.position'));
    const pins = Array.from(document.querySelectorAll('.personal-identification-number'));

    await startMouseSelection(panelDocument);
    _click(tableRows[0]);
    _clickWithCtrl(tableRows[1]);

    await selectingCols(panelDocument);
    await renameCol(panelDocument, '0', 'Name');
    const emailColId = await createNewCol(panelDocument, 'E-mail');
    const positionColId = await createNewCol(panelDocument, 'Position');
    const pinColId = await createNewCol(panelDocument, 'PIN');

    _click(names[0]);
    _clickWithCtrl(names[1]);

    await switchToCol(panelDocument, emailColId);
    _click(emails[0]);
    _clickWithCtrl(emails[1]);

    await switchToCol(panelDocument, positionColId);
    _click(positions[0]);
    _clickWithCtrl(positions[1]);

    await switchToCol(panelDocument, pinColId);
    _click(pins[0]);
    _clickWithCtrl(pins[1]);

    await displayPreview(panelDocument);
    const previewTable = document.querySelector('#scraping-data-preview');
    const previewTableModal = document.querySelector('.scraping-modal');
    const tableHeader = document.querySelector('.scraping-table-header');
    const tableBody = document.querySelector('.scraping-table-body');

    expect(previewTable).not.toBe(null);
    expect(previewTableModal.style.display).toEqual('flex');
    expect(tableHeader.children.length).toBe(5);
    expect(tableHeader.children[1].innerText).toEqual('Name');
    expect(tableHeader.children[2].innerText).toEqual('E-mail');
    expect(tableHeader.children[3].innerText).toEqual('Position');
    expect(tableHeader.children[4].innerText).toEqual('PIN');
    expect(tableBody.children.length).toBe(7);

    expect(tableBody.children[0].children[0].innerText).toEqual('×');
    expect(tableBody.children[0].children[1].innerText).toEqual('Michael Scott');
    expect(tableBody.children[0].children[2].innerText).toEqual('best.boss.ever@scranton.pa');
    expect(tableBody.children[0].children[3].innerText).toEqual('Scranton branch regional manager');
    expect(tableBody.children[0].children[4].innerText).toEqual('620816/0122');

    expect(tableBody.children[1].children[0].innerText).toEqual('×');
    expect(tableBody.children[1].children[1].innerText).toEqual('Dwight Schrute');
    expect(tableBody.children[1].children[2].innerText).toEqual('dwight.schrute@beets.com');
    expect(tableBody.children[1].children[3].innerText).toEqual('Assistant to the regional manager; sales');
    expect(tableBody.children[1].children[4].innerText).toEqual('660120/4010');

    expect(tableBody.children[2].children[0].innerText).toEqual('×');
    expect(tableBody.children[2].children[1].innerText).toEqual('Jim Halpert');
    expect(tableBody.children[2].children[2].innerText).toEqual('jimmyhalpert73@gmail.com');
    expect(tableBody.children[2].children[3].innerText).toEqual('Sales');
    expect(tableBody.children[2].children[4].innerText).toEqual('791020/0079');

    expect(tableBody.children[3].children[0].innerText).toEqual('×');
    expect(tableBody.children[3].children[1].innerText).toEqual('Pamela Beesly');
    expect(tableBody.children[3].children[2].innerText).toEqual('beespam@pambees.ca');
    expect(tableBody.children[3].children[3].innerText).toEqual('Reception');
    expect(tableBody.children[3].children[4].innerText).toEqual('745307/0853');

    expect(tableBody.children[4].children[0].innerText).toEqual('×');
    expect(tableBody.children[4].children[1].innerText).toEqual('Kevin Malone');
    expect(tableBody.children[4].children[2].innerText).toEqual('cookiemonster@m&m.com');
    expect(tableBody.children[4].children[3].innerText).toEqual('Accounting');
    expect(tableBody.children[4].children[4].innerText).toEqual('721129/1001');

    expect(tableBody.children[5].children[0].innerText).toEqual('×');
    expect(tableBody.children[5].children[1].innerText).toEqual('Oscar Martinez');
    expect(tableBody.children[5].children[2].innerText).toEqual('knowitall@example.org');
    expect(tableBody.children[5].children[3].innerText).toEqual('Accounting');
    expect(tableBody.children[5].children[4].innerText).toEqual('581118/7793');

    expect(tableBody.children[6].children[0].innerText).toEqual('×');
    expect(tableBody.children[6].children[1].innerText).toEqual('Stanley Hudson');
    expect(tableBody.children[6].children[2].innerText).toEqual('floridaman8@leavemealone.hu');
    expect(tableBody.children[6].children[3].innerText).toEqual('Sales');
    expect(tableBody.children[6].children[4].innerText).toEqual('580219/0492');

    removeRowFromPreview(tableBody.children[4]);

    expect(tableHeader.children.length).toBe(5);
    expect(tableHeader.children[1].innerText).toEqual('Name');
    expect(tableHeader.children[2].innerText).toEqual('E-mail');
    expect(tableHeader.children[3].innerText).toEqual('Position');
    expect(tableHeader.children[4].innerText).toEqual('PIN');
    expect(tableBody.children.length).toBe(5);

    expect(tableBody.children[0].children[0].innerText).toEqual('×');
    expect(tableBody.children[0].children[1].innerText).toEqual('Dwight Schrute');
    expect(tableBody.children[0].children[2].innerText).toEqual('dwight.schrute@beets.com');
    expect(tableBody.children[0].children[3].innerText).toEqual('Assistant to the regional manager; sales');
    expect(tableBody.children[0].children[4].innerText).toEqual('660120/4010');

    expect(tableBody.children[1].children[0].innerText).toEqual('×');
    expect(tableBody.children[1].children[1].innerText).toEqual('Jim Halpert');
    expect(tableBody.children[1].children[2].innerText).toEqual('jimmyhalpert73@gmail.com');
    expect(tableBody.children[1].children[3].innerText).toEqual('Sales');
    expect(tableBody.children[1].children[4].innerText).toEqual('791020/0079');

    expect(tableBody.children[2].children[0].innerText).toEqual('×');
    expect(tableBody.children[2].children[1].innerText).toEqual('Pamela Beesly');
    expect(tableBody.children[2].children[2].innerText).toEqual('beespam@pambees.ca');
    expect(tableBody.children[2].children[3].innerText).toEqual('Reception');
    expect(tableBody.children[2].children[4].innerText).toEqual('745307/0853');

    expect(tableBody.children[3].children[0].innerText).toEqual('×');
    expect(tableBody.children[3].children[1].innerText).toEqual('Oscar Martinez');
    expect(tableBody.children[3].children[2].innerText).toEqual('knowitall@example.org');
    expect(tableBody.children[3].children[3].innerText).toEqual('Accounting');
    expect(tableBody.children[3].children[4].innerText).toEqual('581118/7793');

    expect(tableBody.children[4].children[0].innerText).toEqual('×');
    expect(tableBody.children[4].children[1].innerText).toEqual('Stanley Hudson');
    expect(tableBody.children[4].children[2].innerText).toEqual('floridaman8@leavemealone.hu');
    expect(tableBody.children[4].children[3].innerText).toEqual('Sales');
    expect(tableBody.children[4].children[4].innerText).toEqual('580219/0492');
});
