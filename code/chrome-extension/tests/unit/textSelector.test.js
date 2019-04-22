import { TextSelector } from '/src/contentScripts/selectEngine/selectors/textSelector.js';
import { SelectEngineMockup } from './mocks.js';
import { _areSelected } from './utils.js';
import { JSDOM } from 'jsdom';


// -------------------------------------------- Setup and teardown ----------------------------------------------

beforeAll(function () {
    Object.defineProperty(global.Element.prototype, 'innerText', {
        get: function () { return this.textContent.replace(/\s\s/g, '').trim() },
    });
});

let selector;
let selectEngine;
beforeEach(async function () {
    selectEngine = new SelectEngineMockup();
    selector = new TextSelector(selectEngine);
    const dom = await JSDOM.fromFile('/home/jakub/BP/code/chrome-extension/tests/unit/testingPage.html');
    document.body.innerHTML = dom.window.document.body.innerHTML;
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('select nodes that starts with `Lorem ipsum` text', () => {
    const firstP = document.querySelector('#first-p');
    const secondP = document.querySelector('#second-p');

    selector.startsWith({ value: 'lorEM iPSuM' });
    _areSelected(selectEngine, [secondP]);
});

test('select nodes that ends with `` text', () => {

});

test('select nodes that contains `` text', () => {

});

test('select nodes whose text is equal to ``', () => {

});