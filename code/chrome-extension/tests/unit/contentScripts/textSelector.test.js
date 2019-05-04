import { TextSelector } from '/src/contentScripts/selectEngine/selectors/textSelector.js';
import { SelectEngineMockup } from '../../mocks.js';
import { defineHTMLProperties, prepareTestPage } from "../../setup";


// -------------------------------------------- Setup and teardown ----------------------------------------------

beforeAll(function () {
    defineHTMLProperties();
});

let selector;
let selectEngine;
beforeEach(async function () {
    await prepareTestPage();
    selectEngine = new SelectEngineMockup();
    selector = new TextSelector(selectEngine);
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('select nodes that starts with `Lorem ipsum` text', () => {
    const firstP = document.querySelector('#first-p');
    const secondP = document.querySelector('#second-p');

    selector.startsWith({ value: 'lorEM iPSuM' });
    expect(selectEngine.selected).toEqual([secondP, firstP]);
});

test('select nodes that ends with `header` text', () => {
    const firstHeader = document.querySelector('#first-article-header');
    const secondHeader = document.querySelector('#second-article-header');

    selector.endsWith({ value: 'HEaDeR' });
    expect(selectEngine.selected).toEqual([secondHeader, firstHeader]);
});

test('select nodes that contains `text` text', () => {
    const firstHeader = document.querySelector('#first-header');
    const firstP = document.querySelector('#first-p');
    const secondHeaderText = document.querySelector('#second-header-text');
    const secondP = document.querySelector('#second-p');

    selector.contains({ value: 'teXT', exactCheck: false });
    expect(selectEngine.selected).toEqual([secondP, secondHeaderText, firstP, firstHeader]);
});

test('select nodes whose text is equal to `Like`', () => {
    const firstLike = document.querySelector('#first-like');
    const secondLike = document.querySelector('#second-like');

    selector.contains({ value: 'like', exactCheck: true });
    expect(selectEngine.selected).toEqual([secondLike, firstLike]);
});