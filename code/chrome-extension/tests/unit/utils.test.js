import { isValid } from '/src/contentScripts/utils.js';
import { JSDOM } from 'jsdom';


// ------------------------------------------------- Helpers -----------------------------------------------------

const _areInvalid = (invalidNodes) => {
    let nodes = [document.body];
    while (nodes.length !== 0) {
        const node = nodes.pop();
        for (const child of node.children) {
            if (invalidNodes.includes(child)) {
                expect(isValid(child)).toBe(false);
            } else {
                expect(isValid(child)).toBe(true);
            }
        }
    }
}

// -------------------------------------------- Setup and teardown ----------------------------------------------

beforeAll(function () {
    // Mocking the `offsetWidth` and `offsetHeight`
    Object.defineProperty(window.HTMLElement.prototype, 'offsetWidth', {
        get: function () { return this._customOffsetWidth !== undefined ? this._customOffsetWidth : 123; }
    });
    Object.defineProperty(window.HTMLElement.prototype, 'offsetHeight', {
        get: function () { return this._customOffsetHeight !== undefined ? this._customOffsetHeight : 123; }
    });
});

beforeEach(async function () {
    const dom = await JSDOM.fromFile('/home/jakub/BP/code/chrome-extension/tests/unit/testingPage.html');
    document.body.innerHTML = dom.window.document.body.innerHTML;

    // Need to set non-inline CSS via JS
    let style = document.createElement('style');
    style.innerHTML =
        '.display-none-class{ display: none; }' +
        '.opacity-zero-class{ opacity: 0; }';
    document.head.appendChild(style);

    // JSDOM does no rendering, so offsetWidth/offsetHeight have to be set via JS
    const hidden2 = document.querySelector('#hidden-div-2');
    hidden2._customOffsetWidth = 0;
    hidden2._customOffsetHeight = 0;
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('validation of nodes', () => {
    const hidden1 = document.querySelector('#hidden-div-1');
    const hidden2 = document.querySelector('#hidden-div-2');
    const hidden3 = document.querySelector('#hidden-div-3');
    const hidden4 = document.querySelector('#hidden-div-4');
    const hidden5 = document.querySelector('#hidden-div-5');
    const hidden6 = document.querySelector('#hidden-div-6');
    const script = document.querySelector('#script');
    const protectedNodes = document.querySelectorAll('.scraping-protected');

    _areInvalid([
        hidden1, hidden2, hidden3, hidden4,
        hidden5, hidden6, script, ...protectedNodes
    ]);
});
