import { TextSelector } from '/src/contentScripts/selectEngine/selectors/textSelector.js';
import { SelectEngineMockup } from '../../mocks.js';
import { defineHTMLProperties, prepareTestPage } from "../../setup.js";


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
    const protectedFields = document.querySelectorAll('.scraping-protected');

    selector.contains({ value: 'teXT', exact: false });
    expect(selectEngine.selected).toEqual([...protectedFields, secondP, secondHeaderText, firstP, firstHeader]);
});

test('select nodes whose text is equal to `Like`', () => {
    const firstLike = document.querySelector('#first-like');
    const secondLike = document.querySelector('#second-like');

    selector.contains({ value: 'like', exact: true });
    expect(selectEngine.selected).toEqual([secondLike, firstLike]);
});

test('empty input does nothing', () => {
    selector.startsWith({ value: '' });
    selector.endsWith({ value: '' });
    selector.contains({ value: '', exact: false });
    selector.contains({ value: '', exact: true });

    expect(selectEngine.selected).toEqual([]);
});

test('input of only whitespace characters does nothing', () => {
    selector.startsWith({ value: '       ' });
    selector.endsWith({ value: '    \t\t\n' });
    selector.contains({ value: ' \n \n \t \n', exact: false });
    selector.contains({ value: '    \t \n  ', exact: true });

    expect(selectEngine.selected).toEqual([]);
});