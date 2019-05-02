import { isValid } from '/src/contentScripts/utils.js';
import { defineHTMLProperties, prepareTestPage } from "./setup";


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
};

// -------------------------------------------- Setup and teardown ----------------------------------------------

beforeAll(function () {
    defineHTMLProperties();
});

beforeEach(async function () {
    await prepareTestPage();
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
