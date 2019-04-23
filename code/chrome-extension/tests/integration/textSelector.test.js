// import { TextSelector } from '/src/contentScripts/selectEngine/selectors/textSelector.js';
// import { SelectEngineMockup } from '../unit/mocks.js';
// import { _areSelected } from '../unit/utils.js';
// import { JSDOM } from 'jsdom';


// // -------------------------------------------- Setup and teardown ----------------------------------------------

// beforeAll(function () {
//     Object.defineProperty(global.Element.prototype, 'innerText', {
//         get: function () { return this.textContent.replace(/\s\s/g, '').trim() },
//     });
// });

// let selector;
// let selectEngine;
// beforeEach(async function () {
//     selectEngine = new SelectEngineMockup();
//     selector = new TextSelector(selectEngine);
//     const dom = await JSDOM.fromFile('/home/jakub/BP/code/chrome-extension/tests/unit/testingPage.html');
//     document.body.innerHTML = dom.window.document.body.innerHTML;
// });

// // -------------------------------------------------- Tests -----------------------------------------------------

// test('select nodes that starts with `Lorem ipsum` text', () => {
//     const firstP = document.querySelector('#first-p');
//     const secondP = document.querySelector('#second-p');

//     selector.startsWith({ value: 'lorEM iPSuM' });
//     _areSelected(selectEngine, [firstP, secondP]);
// });

// test('select nodes that ends with `header` text', () => {
//     const firstHeader = document.querySelector('#first-article-header');
//     const secondHeader = document.querySelector('#second-article-header');

//     selector.endsWith({ value: 'HEaDeR' });
//     _areSelected(selectEngine, [firstHeader, secondHeader]);
// });

// test('select nodes that contains `text` text', () => {
//     const firstHeader = document.querySelector('#first-header');
//     const firstP = document.querySelector('#first-p');
//     const secondHeaderText = document.querySelector('#second-header-text');
//     const secondP = document.querySelector('#second-p');

//     selector.contains({ value: 'teXT', exactCheck: false });
//     _areSelected(selectEngine, [firstHeader, firstP, secondHeaderText, secondP]);
// });

// test('select nodes whose text is equal to ``', () => {

// });