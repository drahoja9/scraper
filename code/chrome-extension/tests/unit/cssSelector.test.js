import { CSSSelector } from "/src/contentScripts/selectEngine/selectors/cssSelector";
import { SelectEngineMockup } from './mocks.js';
import { JSDOM } from 'jsdom';


// -------------------------------------------- Setup and teardown ----------------------------------------------

let selector;
let selectEngine;
beforeEach(async function () {
    selectEngine = new SelectEngineMockup();
    selector = new CSSSelector(selectEngine);
    const dom = await JSDOM.fromFile('/home/jakub/BP/code/chrome-extension/tests/unit/testingPage.html');
    document.body.innerHTML = dom.window.document.body.innerHTML;
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('select all `div` tags', () => {
    const divs = document.querySelectorAll('div');

    selector.select({ selector: 'div' });
    expect(selectEngine.selected).toEqual(Array.from(divs));
});

test('select all `row` classes', () => {
    const rows = document.querySelectorAll('.row');

    selector.select({ selector: '.row' });
    expect(selectEngine.selected).toEqual(Array.from(rows));
});

test('select all nodes with `special` attribute', () => {
    const nodes = document.querySelectorAll('[special]');

    selector.select({ selector: '[special]' });
    expect(selectEngine.selected).toEqual(Array.from(nodes));
});

test('select all nodes that are not hidden', () => {
    const nodes = document.querySelectorAll(':not([hidden])');

    selector.select({ selector: ':not([hidden])' });
    expect(selectEngine.selected).toEqual(Array.from(nodes));
});

test('select all `td` that are second child of its parent', () => {
    const nodes = document.querySelectorAll('td:nth-child(2)');

    selector.select({ selector: 'td:nth-child(2)' });
    expect(selectEngine.selected).toEqual(Array.from(nodes));
});

test('unselect current selection', () => {
    const divs = document.querySelectorAll('div');

    selector.select({ selector: 'div' });
    expect(selectEngine.selected).toEqual(Array.from(divs));

    selector.unselectCurrent();
    expect(selectEngine.selected).toEqual([]);
});