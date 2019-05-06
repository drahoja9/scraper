import { Controller } from "/src/contentScripts/controller.js";
import { _click, _mouseover } from "../utils.js";
import { DOMWindowSetup } from "./integrationSetup.js";
import { startMouseSelection } from "./integrationUtils.js";


// -------------------------------------------- Setup and teardown ----------------------------------------------

let controller;

beforeEach(async function () {
    await DOMWindowSetup();
    controller = new Controller();
    await controller.init(false, false, false);
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('highlight an element on hover', async () => {
    const firstImg = document.querySelector('#first-img');
    await startMouseSelection();

    _mouseover(firstImg);
    expect(firstImg.classList.contains('scraping-highlighted-row')).toBe(true);
});

test('select an element with mouse selector', async () => {
    const firstP = document.querySelector('#first-p');
    await startMouseSelection();

    _click(firstP);
    expect(firstP.classList.contains('scraping-selected-row')).toBe(true);
    expect(firstP.classList.contains('scraping-row-0')).toBe(true);
});

test('do not select an invalid element', async () => {
    const hiddenDiv = document.querySelector('#hidden-div-1');
    await startMouseSelection();

    _click(hiddenDiv);
    expect(hiddenDiv.classList.contains('scraping-selected-row')).toBe(false);
    expect(hiddenDiv.classList.contains('scraping-row-0')).toBe(false);
});

test('each selected row has unique row number', async () => {
    const container = document.querySelector('#container');
    const firstPost = document.querySelector('#post-1');
    const firstArticleHeader = document.querySelector('#first-article-header');
    await startMouseSelection();

    _click(container);
    _click(firstPost);
    _click(firstArticleHeader);

    expect(container.classList.contains('scraping-row-0')).toBe(true);
    expect(container.classList.contains('scraping-row-1')).toBe(false);
    expect(container.classList.contains('scraping-row-2')).toBe(false);

    expect(firstPost.classList.contains('scraping-row-0')).toBe(false);
    expect(firstPost.classList.contains('scraping-row-1')).toBe(true);
    expect(firstPost.classList.contains('scraping-row-2')).toBe(false);

    expect(firstArticleHeader.classList.contains('scraping-row-0')).toBe(false);
    expect(firstArticleHeader.classList.contains('scraping-row-1')).toBe(false);
    expect(firstArticleHeader.classList.contains('scraping-row-2')).toBe(true);
});

// test('each column has unique col number, but columns can contain multiple elements', async () => {
//     const container = document.querySelector('#container');
//     const firstPost = document.querySelector('#post-1');
//     const firstArticleHeader = document.querySelector('#first-article-header');
//     await startMouseSelection();
//
//
// });

test('', async () => {

});

test('', async () => {

});

test('', async () => {

});

test('', async () => {

});
