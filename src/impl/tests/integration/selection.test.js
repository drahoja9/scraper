import { Controller } from "/src/contentScripts/controller.js";
import { _click, _clickWithCtrl, _mouseout, _mouseover } from "../utils.js";
import { DOMWindowSetup } from "./integrationSetup.js";
import {
    createNewCol,
    cssEnterEmptySelector,
    cssSelect,
    redo,
    selectingCols,
    selectingRows,
    startExtension,
    startMouseSelection,
    switchToCol,
    textSelectContains,
    textSelectEndsWith,
    textSelectStartsWith,
    undo,
} from "./integrationUtils.js";


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

test('highlight an element on hover', async () => {
    await startMouseSelection(panelDocument);
    const firstImg = document.querySelector('#first-img');

    _mouseover(firstImg);
    expect(firstImg.classList.contains('scraping-highlighted-row')).toBe(true);

    _mouseout(firstImg);
    expect(firstImg.classList.contains('scraping-highlighted-row')).toBe(false);

    await selectingCols(panelDocument);

    _mouseover(firstImg);
    expect(firstImg.classList.contains('scraping-highlighted-col')).toBe(true);

    _mouseout(firstImg);
    expect(firstImg.classList.contains('scraping-highlighted-col')).toBe(false);
});

test('do not highlight protected elements', async () => {
    const protectedElements = document.querySelectorAll('.scraping-protected');
    await startMouseSelection(panelDocument);

    for (const el of protectedElements) {
        _mouseover(el);
        expect(el.classList.contains('scraping-highlighted-row')).toBe(false);
    }
});

test('select an element with mouse selector', async () => {
    const firstP = document.querySelector('#first-p');
    const firstImg = document.querySelector('#first-img');
    await startMouseSelection(panelDocument);

    _click(firstP);
    expect(firstP.classList.contains('scraping-selected-row')).toBe(true);

    await selectingCols(panelDocument);

    _click(firstImg);
    expect(firstImg.classList.contains('scraping-selected-col')).toBe(true);
});

test('select multiple elements with auto-select (mouse selector) based on a class', async () => {
    const allDivCols = Array.from(document.querySelectorAll('div.col'));
    const firstDiv = document.querySelector('#first-div');
    const firstContentDiv = document.querySelector('#first-content-div');

    await startMouseSelection(panelDocument);
    _click(firstDiv);
    _clickWithCtrl(firstContentDiv);
    allDivCols.forEach(node => expect(node.classList.contains('scraping-selected-row')).toBe(true));
});

test('select multiple elements with auto-select (mouse selector) based on a tag name', async () => {
    const allPs = Array.from(document.querySelectorAll('p'));
    const firstP = document.querySelector('#first-p');
    const secondHeaderText = document.querySelector('#second-header-text');

    await startMouseSelection(panelDocument);
    _click(firstP);
    _clickWithCtrl(secondHeaderText);
    allPs.forEach(node => expect(node.classList.contains('scraping-selected-row')).toBe(true));
});

test('select multiple elements with auto-select (mouse selector) based on a attribute', async () => {
    const all = Array.from(document.querySelectorAll('[data-attribute="332"]'));
    const firstImgDiv = document.querySelector('#first-img-div');
    const firstLike = document.querySelector('#first-like');

    await startMouseSelection(panelDocument);
    _click(firstImgDiv);
    _clickWithCtrl(firstLike);
    all.forEach(node => expect(node.classList.contains('scraping-selected-row')).toBe(true));
});

test('select elements with `startsWith` text selector', async () => {
    const firstP = document.querySelector('#first-p');
    const secondP = document.querySelector('#second-p');
    await textSelectStartsWith(panelDocument, 'Lorem ipsum');

    expect(firstP.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondP.classList.contains('scraping-selected-row')).toBe(true);
});

test('select elements with `endsWith` text selector', async () => {
    const firstP = document.querySelector('#first-p');
    const secondP = document.querySelector('#second-p');
    await textSelectEndsWith(panelDocument, 'text.');

    expect(firstP.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondP.classList.contains('scraping-selected-row')).toBe(true);
});

test('select elements with `contains` text selector', async () => {
    const firstP = document.querySelector('#first-p');
    const secondP = document.querySelector('#second-p');
    const firstHeader = document.querySelector('#first-header');
    const secondHeaderText = document.querySelector('#second-header-text');
    const firstLike = document.querySelector('#first-like');
    const secondLike = document.querySelector('#second-like');
    const firstRowSpan = document.querySelector('#first-row-span');

    await textSelectContains(panelDocument, 'text');
    expect(firstP.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondP.classList.contains('scraping-selected-row')).toBe(true);
    expect(firstHeader.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondHeaderText.classList.contains('scraping-selected-row')).toBe(true);

    await textSelectContains(panelDocument, 'like', true);
    expect(firstLike.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondLike.classList.contains('scraping-selected-row')).toBe(true);
    expect(firstRowSpan.classList.contains('scraping-selected-row')).toBe(false);
});

test('select elements with CSS selector', async () => {
    const divs = document.querySelectorAll('div');
    const divsWithoutHidden = Array.from(divs).filter(div => div.innerText.indexOf('hidden') === -1);
    const divsWithoutProtected = divsWithoutHidden.filter(div => !div.classList.contains('scraping-protected'));

    await cssSelect(panelDocument, 'div');
    divsWithoutProtected.forEach(div => expect(div.classList.contains('scraping-selected-row')).toBe(true));
});

test('CSS selection unselects only elements that it has selected', async () => {
    const container = document.querySelector('#container');
    const divs = document.querySelectorAll('div');
    const divsWithoutHidden = Array.from(divs).filter(div => div.innerText.indexOf('hidden') === -1);
    const divsWithoutProtected = divsWithoutHidden.filter(div => !div.classList.contains('scraping-protected'));
    const divsWithoutContainer = divsWithoutProtected.filter(div => div.id !== 'container');

    await startMouseSelection(panelDocument);
    _click(container);
    await cssSelect(panelDocument, 'div');
    divsWithoutContainer.forEach(div => expect(div.classList.contains('scraping-selected-row')).toBe(true));
    expect(container.classList.contains('scraping-selected-row')).toBe(true);

    await cssEnterEmptySelector(panelDocument);
    divsWithoutContainer.forEach(div => expect(div.classList.contains('scraping-selected-row')).toBe(false));
    expect(container.classList.contains('scraping-selected-row')).toBe(true);
});

test('css selection does not unselect elements on double select', async () => {
    const divs = document.querySelectorAll('div');
    const divsWithoutHidden = Array.from(divs).filter(div => div.innerText.indexOf('hidden') === -1);
    const divsWithoutProtected = divsWithoutHidden.filter(div => !div.classList.contains('scraping-protected'));

    await cssSelect(panelDocument, 'div');
    divsWithoutProtected.forEach(div => expect(div.classList.contains('scraping-selected-row')).toBe(true));

    await cssSelect(panelDocument, 'div');
    divsWithoutProtected.forEach(div => expect(div.classList.contains('scraping-selected-row')).toBe(true));
});

test('text selection does not unselect elements on double select', async () => {
    const firstP = document.querySelector('#first-p');
    const secondP = document.querySelector('#second-p');

    await startMouseSelection(panelDocument);
    _click(firstP);
    _click(secondP);
    expect(firstP.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondP.classList.contains('scraping-selected-row')).toBe(true);

    await textSelectEndsWith(panelDocument, 'text.');
    expect(firstP.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondP.classList.contains('scraping-selected-row')).toBe(true);
});

test('do not select an invalid element', async () => {
    const hiddenDiv1 = document.querySelector('#hidden-div-1');
    const hiddenDiv2 = document.querySelector('#hidden-div-2');
    const hiddenDiv3 = document.querySelector('#hidden-div-3');
    const hiddenDiv4 = document.querySelector('#hidden-div-4');
    const hiddenDiv5 = document.querySelector('#hidden-div-5');
    const hiddenDiv6 = document.querySelector('#hidden-div-6');
    const protected1 = document.querySelector('#protected-1');
    const protected2 = document.querySelector('#protected-2');
    const protected3 = document.querySelector('#protected-3');
    const allInvalidElements = [
        hiddenDiv1, hiddenDiv2, hiddenDiv3, hiddenDiv4, hiddenDiv5,
        hiddenDiv6, protected1, protected2, protected3
    ];
    await startMouseSelection(panelDocument);

    allInvalidElements.forEach(el => _click(el));
    allInvalidElements.forEach(el => expect(el.classList.contains('scraping-selected-row')).toBe(false));

    await textSelectStartsWith(panelDocument, 'This is hidden');
    allInvalidElements.forEach(el => expect(el.classList.contains('scraping-selected-row')).toBe(false));
});

test('each selected row has unique row number', async () => {
    const container = document.querySelector('#container');
    const firstPost = document.querySelector('#post-1');
    const firstArticleHeader = document.querySelector('#first-article-header');
    const firstP = document.querySelector('#first-p');
    const secondP = document.querySelector('#second-p');

    await startMouseSelection(panelDocument);
    _click(container);
    _click(firstPost);
    _click(firstArticleHeader);

    expect(container.classList.contains('scraping-row-0')).toBe(true);
    expect(container.classList.contains('scraping-row-1')).toBe(false);
    expect(container.classList.contains('scraping-row-2')).toBe(false);
    expect(container.classList.contains('scraping-row-3')).toBe(false);
    expect(container.classList.contains('scraping-row-4')).toBe(false);

    expect(firstPost.classList.contains('scraping-row-0')).toBe(false);
    expect(firstPost.classList.contains('scraping-row-1')).toBe(true);
    expect(firstPost.classList.contains('scraping-row-2')).toBe(false);
    expect(firstPost.classList.contains('scraping-row-3')).toBe(false);
    expect(firstPost.classList.contains('scraping-row-4')).toBe(false);

    expect(firstArticleHeader.classList.contains('scraping-row-0')).toBe(false);
    expect(firstArticleHeader.classList.contains('scraping-row-1')).toBe(false);
    expect(firstArticleHeader.classList.contains('scraping-row-2')).toBe(true);
    expect(firstArticleHeader.classList.contains('scraping-row-3')).toBe(false);
    expect(firstArticleHeader.classList.contains('scraping-row-4')).toBe(false);

    await textSelectContains(panelDocument, 'Lorem ipsum');
    expect(secondP.classList.contains('scraping-row-0')).toBe(false);
    expect(secondP.classList.contains('scraping-row-1')).toBe(false);
    expect(secondP.classList.contains('scraping-row-2')).toBe(false);
    expect(secondP.classList.contains('scraping-row-3')).toBe(true);
    expect(secondP.classList.contains('scraping-row-4')).toBe(false);

    expect(firstP.classList.contains('scraping-row-0')).toBe(false);
    expect(firstP.classList.contains('scraping-row-1')).toBe(false);
    expect(firstP.classList.contains('scraping-row-2')).toBe(false);
    expect(firstP.classList.contains('scraping-row-3')).toBe(false);
    expect(firstP.classList.contains('scraping-row-4')).toBe(true);
});

test('each column has unique col number, but columns can contain multiple elements', async () => {
    const container = document.querySelector('#container');
    const firstPost = document.querySelector('#post-1');
    const firstArticleHeader = document.querySelector('#first-article-header');
    const firstLike = document.querySelector('#first-like');
    const firstP = document.querySelector('#first-p');
    const secondP = document.querySelector('#second-p');

    await startMouseSelection(panelDocument);
    await selectingCols(panelDocument);
    const colId1 = await createNewCol(panelDocument);
    const colId2 = await createNewCol(panelDocument);

    _click(container);
    expect(container.classList.contains('scraping-col-0')).toBe(true);
    expect(container.classList.contains('scraping-col-1')).toBe(false);
    expect(container.classList.contains('scraping-col-2')).toBe(false);

    await switchToCol(panelDocument, colId1);
    _click(firstPost);
    _click(firstArticleHeader);
    _click(firstLike);
    expect(firstPost.classList.contains('scraping-col-0')).toBe(false);
    expect(firstPost.classList.contains('scraping-col-1')).toBe(true);
    expect(firstPost.classList.contains('scraping-col-2')).toBe(false);
    expect(firstArticleHeader.classList.contains('scraping-col-0')).toBe(false);
    expect(firstArticleHeader.classList.contains('scraping-col-1')).toBe(true);
    expect(firstArticleHeader.classList.contains('scraping-col-2')).toBe(false);
    expect(firstLike.classList.contains('scraping-col-0')).toBe(false);
    expect(firstLike.classList.contains('scraping-col-1')).toBe(true);
    expect(firstLike.classList.contains('scraping-col-2')).toBe(false);

    await switchToCol(panelDocument, colId2);
    await textSelectEndsWith(panelDocument, 'text.');
    expect(firstP.classList.contains('scraping-col-0')).toBe(false);
    expect(firstP.classList.contains('scraping-col-1')).toBe(false);
    expect(firstP.classList.contains('scraping-col-2')).toBe(true);
    expect(secondP.classList.contains('scraping-col-0')).toBe(false);
    expect(secondP.classList.contains('scraping-col-1')).toBe(false);
    expect(secondP.classList.contains('scraping-col-2')).toBe(true);
});

test('one element can be in multiple columns', async () => {
    const element = document.querySelector('#scraping-3');
    await startMouseSelection(panelDocument);
    await selectingCols(panelDocument);
    const colId1 = await createNewCol(panelDocument);
    const colId2 = await createNewCol(panelDocument);

    _click(element);
    await switchToCol(panelDocument, colId1);
    _click(element);
    await switchToCol(panelDocument, colId2);
    _click(element);

    expect(element.classList.contains('scraping-col-0')).toBe(true);
    expect(element.classList.contains('scraping-col-1')).toBe(true);
    expect(element.classList.contains('scraping-col-2')).toBe(true);
});

test('one element can be a row and also a column', async () => {
    const element = document.querySelector('#scraping-3');
    await startMouseSelection(panelDocument);
    _click(element);
    await selectingCols(panelDocument);
    _click(element);

    expect(element.classList.contains('scraping-selected-row')).toBe(true);
    expect(element.classList.contains('scraping-row-0')).toBe(true);
    expect(element.classList.contains('scraping-selected-col')).toBe(true);
    expect(element.classList.contains('scraping-col-0')).toBe(true);
});

test('unselect an element with mouse selector', async () => {
    const firstRowSpan = document.querySelector('#first-row-span');
    await startMouseSelection(panelDocument);
    _click(firstRowSpan);
    await selectingCols(panelDocument);
    _click(firstRowSpan);

    _click(firstRowSpan);
    expect(firstRowSpan.classList.contains('scraping-selected-row')).toBe(true);
    expect(firstRowSpan.classList.contains('scraping-selected-col')).toBe(false);

    await selectingRows(panelDocument);
    _click(firstRowSpan);
    expect(firstRowSpan.classList.contains('scraping-selected-row')).toBe(false);
    expect(firstRowSpan.classList.contains('scraping-selected-col')).toBe(false);

    await textSelectContains(panelDocument, 'LikeLike', true);
    expect(firstRowSpan.classList.contains('scraping-selected-row')).toBe(true);

    _click(firstRowSpan);
    expect(firstRowSpan.classList.contains('scraping-selected-row')).toBe(false);
});

test('display selection of only active column', async () => {
    const firstLike = document.querySelector('#first-like');
    const secondLike = document.querySelector('#second-like');
    const firstRetweet = document.querySelector('#first-retweet');

    await startMouseSelection(panelDocument);
    await selectingCols(panelDocument);
    const colId0 = '0';
    const colId1 = await createNewCol(panelDocument);
    const colId2 = await createNewCol(panelDocument);

    _click(firstLike);
    await switchToCol(panelDocument, colId1);
    _click(secondLike);
    await switchToCol(panelDocument, colId2);
    _click(firstRetweet);

    await switchToCol(panelDocument, colId0);
    expect(firstLike.classList.contains('scraping-active')).toBe(true);
    expect(secondLike.classList.contains('scraping-active')).toBe(false);
    expect(firstRetweet.classList.contains('scraping-active')).toBe(false);

    await switchToCol(panelDocument, colId1);
    expect(firstLike.classList.contains('scraping-active')).toBe(false);
    expect(secondLike.classList.contains('scraping-active')).toBe(true);
    expect(firstRetweet.classList.contains('scraping-active')).toBe(false);

    await switchToCol(panelDocument, colId2);
    expect(firstLike.classList.contains('scraping-active')).toBe(false);
    expect(secondLike.classList.contains('scraping-active')).toBe(false);
    expect(firstRetweet.classList.contains('scraping-active')).toBe(true);
});

test('undoing and redoing the previous selection', async () => {
    const container = document.querySelector('#container');
    await startMouseSelection(panelDocument);

    _click(container);
    expect(container.classList.contains('scraping-selected-row')).toBe(true);

    await undo(panelDocument);
    expect(container.classList.contains('scraping-selected-row')).toBe(false);

    await redo(panelDocument);
    expect(container.classList.contains('scraping-selected-row')).toBe(true);
});

test('both row and column have their own undo/redo', async () => {
    const firstImg = document.querySelector('#first-img');
    const secondImg = document.querySelector('#second-img');

    await startMouseSelection(panelDocument);
    _click(firstImg);
    await selectingCols(panelDocument);
    _click(secondImg);
    expect(firstImg.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondImg.classList.contains('scraping-selected-col')).toBe(true);

    await selectingRows(panelDocument);
    await undo(panelDocument);
    expect(firstImg.classList.contains('scraping-selected-row')).toBe(false);
    expect(secondImg.classList.contains('scraping-selected-col')).toBe(true);

    await selectingCols(panelDocument);
    await undo(panelDocument);
    expect(firstImg.classList.contains('scraping-selected-row')).toBe(false);
    expect(secondImg.classList.contains('scraping-selected-col')).toBe(false);

    await selectingRows(panelDocument);
    await redo(panelDocument);
    expect(firstImg.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondImg.classList.contains('scraping-selected-col')).toBe(false);

    await selectingCols(panelDocument);
    await redo(panelDocument);
    expect(firstImg.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondImg.classList.contains('scraping-selected-col')).toBe(true);
});

test('each column has its own undo/redo', async () => {
    const firstLike = document.querySelector('#first-like');
    const secondLike = document.querySelector('#second-like');
    const secondRetweet = document.querySelector('#second-retweet');

    await startMouseSelection(panelDocument);
    await selectingCols(panelDocument);
    const colId0 = '0';
    const colId1 = await createNewCol(panelDocument);
    const colId2 = await createNewCol(panelDocument);
    _click(firstLike);
    await switchToCol(panelDocument, colId1);
    _click(secondLike);
    await switchToCol(panelDocument, colId2);
    _click(secondRetweet);

    expect(firstLike.classList.contains('scraping-selected-col')).toBe(true);
    expect(secondLike.classList.contains('scraping-selected-col')).toBe(true);
    expect(secondRetweet.classList.contains('scraping-selected-col')).toBe(true);

    await switchToCol(panelDocument, colId0);
    await undo(panelDocument);
    expect(firstLike.classList.contains('scraping-selected-col')).toBe(false);
    expect(secondLike.classList.contains('scraping-selected-col')).toBe(true);
    expect(secondRetweet.classList.contains('scraping-selected-col')).toBe(true);

    await switchToCol(panelDocument, colId1);
    await undo(panelDocument);
    expect(firstLike.classList.contains('scraping-selected-col')).toBe(false);
    expect(secondLike.classList.contains('scraping-selected-col')).toBe(false);
    expect(secondRetweet.classList.contains('scraping-selected-col')).toBe(true);

    await switchToCol(panelDocument, colId2);
    await undo(panelDocument);
    expect(firstLike.classList.contains('scraping-selected-col')).toBe(false);
    expect(secondLike.classList.contains('scraping-selected-col')).toBe(false);
    expect(secondRetweet.classList.contains('scraping-selected-col')).toBe(false);

    await switchToCol(panelDocument, colId0);
    await redo(panelDocument);
    expect(firstLike.classList.contains('scraping-selected-col')).toBe(true);
    expect(secondLike.classList.contains('scraping-selected-col')).toBe(false);
    expect(secondRetweet.classList.contains('scraping-selected-col')).toBe(false);

    await switchToCol(panelDocument, colId2);
    await redo(panelDocument);
    expect(firstLike.classList.contains('scraping-selected-col')).toBe(true);
    expect(secondLike.classList.contains('scraping-selected-col')).toBe(false);
    expect(secondRetweet.classList.contains('scraping-selected-col')).toBe(true);

    await switchToCol(panelDocument, colId1);
    await redo(panelDocument);
    expect(firstLike.classList.contains('scraping-selected-col')).toBe(true);
    expect(secondLike.classList.contains('scraping-selected-col')).toBe(true);
    expect(secondRetweet.classList.contains('scraping-selected-col')).toBe(true);
});

test('auto-select behaves as one selection when undoing/redoing', async () => {
    const allPs = Array.from(document.querySelectorAll('p'));
    const autoSelected = allPs.filter(p => p.id !== 'first-p' && p.id !== 'second-header-text');
    const firstP = document.querySelector('#first-p');
    const secondHeaderText = document.querySelector('#second-header-text');

    await startMouseSelection(panelDocument);
    _click(firstP);
    _clickWithCtrl(secondHeaderText);
    expect(firstP.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondHeaderText.classList.contains('scraping-selected-row')).toBe(true);
    autoSelected.forEach(node => expect(node.classList.contains('scraping-selected-row')).toBe(true));

    await undo(panelDocument);
    expect(firstP.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondHeaderText.classList.contains('scraping-selected-row')).toBe(true);
    autoSelected.forEach(node => expect(node.classList.contains('scraping-selected-row')).toBe(false));

    await undo(panelDocument);
    expect(firstP.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondHeaderText.classList.contains('scraping-selected-row')).toBe(false);
    autoSelected.forEach(node => expect(node.classList.contains('scraping-selected-row')).toBe(false));

    await redo(panelDocument);
    expect(firstP.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondHeaderText.classList.contains('scraping-selected-row')).toBe(true);
    autoSelected.forEach(node => expect(node.classList.contains('scraping-selected-row')).toBe(false));

    await redo(panelDocument);
    expect(firstP.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondHeaderText.classList.contains('scraping-selected-row')).toBe(true);
    autoSelected.forEach(node => expect(node.classList.contains('scraping-selected-row')).toBe(true));
});

test('text select behaves as one selection when undoing/redoing', async () => {
    const firstLike = document.querySelector('#first-like');
    const secondLike = document.querySelector('#second-like');
    const firstRowSpan = document.querySelector('#first-row-span');

    await textSelectEndsWith(panelDocument, 'like');
    expect(firstLike.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondLike.classList.contains('scraping-selected-row')).toBe(true);
    expect(firstRowSpan.classList.contains('scraping-selected-row')).toBe(true);

    await undo(panelDocument);
    expect(firstLike.classList.contains('scraping-selected-row')).toBe(false);
    expect(secondLike.classList.contains('scraping-selected-row')).toBe(false);
    expect(firstRowSpan.classList.contains('scraping-selected-row')).toBe(false);

    await redo(panelDocument);
    expect(firstLike.classList.contains('scraping-selected-row')).toBe(true);
    expect(secondLike.classList.contains('scraping-selected-row')).toBe(true);
    expect(firstRowSpan.classList.contains('scraping-selected-row')).toBe(true);
});

test('CSS select behaves as one selection when undoing/redoing', async () => {
    const allImgs = Array.from(document.querySelectorAll('img'));

    await cssSelect(panelDocument, 'img');
    allImgs.forEach(node => expect(node.classList.contains('scraping-selected-row')).toBe(true));

    await undo(panelDocument);
    allImgs.forEach(node => expect(node.classList.contains('scraping-selected-row')).toBe(false));

    await redo(panelDocument);
    allImgs.forEach(node => expect(node.classList.contains('scraping-selected-row')).toBe(true));
});
