import { SelectEngine } from '/src/contentScripts/selectEngine/selectEngine.js';
import { Messages } from '/src/constants.js';
import { JSDOM } from 'jsdom';


// -------------------------------------------- Setup and teardown ----------------------------------------------

beforeEach(async function () {
    const dom = await JSDOM.fromFile('/home/jakub/BP/code/chrome-extension/tests/unit/testingPage.html');
    document.body.innerHTML = dom.window.document.body.innerHTML;
});

afterEach(function () {
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('', () => {

});
