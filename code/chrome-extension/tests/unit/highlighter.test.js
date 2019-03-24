import { Highlighter } from '../../src/contentScripts/highlighter.js';
import { JSDOM } from 'jsdom';


// ------------------------------------------------- Helpers ----------------------------------------------------

const _checkWholeDOM = (selected) => {
    let nodes = [document.body];
    while (nodes.length !== 0) {
        let current = nodes.pop();
        for (let child of current.children) {
            if (selected.includes(child)) {
                expect(child.classList.contains('scraping-selected')).toBe(true);
            } else {
                expect(child.classList.contains('scraping-selected')).toBe(false);
            }
            nodes.push(child);
        }
    }
};

const _mouseover = (node) => {
    node.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
}

const _mouseout = (node) => {
    node.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
}

const _click = (node) => {
    node.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true
    }));
}

// -------------------------------------------- Setup and teardown ----------------------------------------------

beforeAll(function () {
    // Mocking the `offsetWidth` and `offsetHeight`
    Object.defineProperty(window.HTMLElement.prototype, 'offsetWidth', { value: 123 });
    Object.defineProperty(window.HTMLElement.prototype, 'offsetHeight', { value: 123 });
});

let highlighter;
beforeEach(async function () {
    highlighter = new Highlighter();
    const dom = await JSDOM.fromFile('/home/jakub/BP/code/chrome-extension/tests/unit/testingPage.html');
    document.body.innerHTML = dom.window.document.body.innerHTML;
});

afterEach(function () {
    if (highlighter) {
        // Unregistering all listeners on the target DOM at the end of every function
        highlighter.toggle(false);
    }
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('turns the highlighter on and off', () => {
    const firstDiv = document.querySelector('#first-div');
    const thirdDiv = document.querySelector('#third-div');

    highlighter.toggle();
    _click(firstDiv);
    expect(firstDiv.classList.contains('scraping-selected')).toBe(true);

    highlighter.toggle();
    _click(thirdDiv);
    expect(thirdDiv.classList.contains('scraping-selected')).toBe(false);

    highlighter.toggle();
    _click(thirdDiv);
    expect(thirdDiv.classList.contains('scraping-selected')).toBe(true);
});

test('selects the element on click, unselects after another', () => {
    const firstHeader = document.querySelector('#first-header');
    const firstDiv = document.querySelector('#first-div');

    highlighter.toggle();

    _click(firstHeader);
    expect(firstHeader.classList.contains('scraping-selected')).toBe(true);
    expect(firstHeader.classList.contains('scraping-selected-current')).toBe(true);

    _click(firstDiv);
    expect(firstDiv.classList.contains('scraping-selected')).toBe(true);
    expect(firstDiv.classList.contains('scraping-selected-current')).toBe(true);
    expect(firstHeader.classList.contains('scraping-selected')).toBe(true);
    expect(firstHeader.classList.contains('scraping-selected-current')).toBe(false);

    _click(firstHeader);
    expect(firstHeader.classList.contains('scraping-selected')).toBe(false);
    expect(firstHeader.classList.contains('scraping-selected-current')).toBe(false);

    _click(firstDiv);
    expect(firstDiv.classList.contains('scraping-selected')).toBe(false);
    expect(firstDiv.classList.contains('scraping-selected-current')).toBe(false);
});

test('selects only clicked element', () => {
    const container = document.querySelector('#container');
    const firstDiv = document.querySelector('#first-div');
    const secondDiv = document.querySelector('#second-div');

    highlighter.toggle();
    _click(firstDiv);
    expect(firstDiv.classList.contains('scraping-selected')).toBe(true);
    expect(container.classList.contains('scraping-selected')).toBe(false);
    expect(secondDiv.classList.contains('scraping-selected')).toBe(false);
    expect(firstDiv.classList.contains('scraping-selected-current')).toBe(true);
    expect(container.classList.contains('scraping-selected-current')).toBe(false);
    expect(secondDiv.classList.contains('scraping-selected-current')).toBe(false);
});

test('highlights the element on mouseover, unhighlights on mouseout', () => {
    const firstHeader = document.querySelector('#first-header');

    highlighter.toggle();
    _mouseover(firstHeader);
    expect(firstHeader.classList.contains('scraping-highlighted')).toBe(true);
    _mouseout(firstHeader);
    expect(firstHeader.classList.contains('scraping-highlighted')).toBe(false);
    _mouseover(firstHeader);
    expect(firstHeader.classList.contains('scraping-highlighted')).toBe(true);
});

test('current setter does not unselect manualy selected elements', () => {
    const container = document.querySelector('#container');
    const firstDiv = document.querySelector('#first-div');
    const secondDiv = document.querySelector('#second-div');

    highlighter.toggle();
    _click(container);
    expect(container.classList.contains('scraping-selected')).toBe(true);
    expect(container.classList.contains('scraping-selected-current')).toBe(true);

    _click(firstDiv);
    highlighter.current = container;
    highlighter.current = secondDiv;
    highlighter.current = firstDiv;
    expect(container.classList.contains('scraping-selected')).toBe(true);
    expect(container.classList.contains('scraping-selected-current')).toBe(false);
    expect(firstDiv.classList.contains('scraping-selected')).toBe(true);
    expect(firstDiv.classList.contains('scraping-selected-current')).toBe(true);
    expect(secondDiv.classList.contains('scraping-selected')).toBe(false);
    expect(secondDiv.classList.contains('scraping-selected-current')).toBe(false);
});

test('notifies listeners about changes', () => {
    let messages = [];
    const messageCatcher = (msg) => { messages.push(msg) }

    const firstDiv = document.querySelector('#first-div');
    const firstImgDiv = document.querySelector('#first-img-div');

    highlighter.toggle();
    highlighter.addListener(messageCatcher);

    _click(firstDiv);
    expect(messages).toEqual(['SELECTED']);

    messages = [];
    _click(firstImgDiv);
    expect(messages).toEqual(['DECIDE_AUTO_SELECT', 'SELECTED']);

    messages = [];
    _click(firstImgDiv);
    expect(messages).toEqual(['UNSELECTED']);
});

describe('auto-select test suite', () => {
    test('rejects auto-select', () => {
        const firstDiv = document.querySelector('#first-div');
        const firstImgDiv = document.querySelector('#first-img-div');
        const secondImgDiv = document.querySelector('#second-img-div');
        const firstContentDiv = document.querySelector('#first-content-div');
        const secondContentDiv = document.querySelector('#second-content-div');
        const firstSpanDiv = document.querySelector('#first-span-div');
        const secondSpanDiv = document.querySelector('#second-span-div');

        highlighter.toggle();
        _click(firstDiv);
        _click(firstContentDiv);
        // Auto-select should choose all elements with `col` class
        _checkWholeDOM([
            firstDiv, firstContentDiv, firstImgDiv, secondImgDiv,
            secondContentDiv, firstSpanDiv, secondSpanDiv
        ]);

        highlighter.rejectAutoSelect();
        _checkWholeDOM([firstDiv, firstContentDiv]);

        _click(firstImgDiv);
        _checkWholeDOM([
            firstDiv, firstContentDiv, firstImgDiv, secondImgDiv,
            secondContentDiv, firstSpanDiv, secondSpanDiv
        ]);
    });

    test('accepts auto-select', () => {
        const firstImgDiv = document.querySelector('#first-img-div');
        const firstLike = document.querySelector('#first-like');
        const secondText = document.querySelector('#second-text');

        highlighter.toggle();
        _click(firstImgDiv);
        _click(secondText);
        // Auto-select should choose all elements with `data-attribute="332"` attribute
        _checkWholeDOM([firstImgDiv, secondText, firstLike]);

        highlighter.acceptAutoSelect();
        _checkWholeDOM([firstImgDiv, secondText, firstLike]);
    });

    test('does not auto-select invalid elements', async function () {
        const firstHeader = document.querySelector('#first-header');
        const secondHeader = document.querySelector('#second-header');
        const firstText = document.querySelector('#first-text');
        const secondText = document.querySelector('#second-text');
        const secondDiv = document.querySelector('#second-div');
        const thirdDiv = document.querySelector('#third-div');
        const firstSocialButtons = document.querySelector('#first-social-buttons');
        const secondSocialButtons = document.querySelector('#second-social-buttons');
        const firstRowSpan = document.querySelector('#first-row-span');
        const secondRowSpan = document.querySelector('#second-row-span');
        const secondHidden = document.querySelector('#hidden-div-2');

        // Mocking up the `offsetWidth` and `offsetHeight` of this particular node
        Object.defineProperty(secondHidden, 'offsetWidth', { value: 0 });
        Object.defineProperty(secondHidden, 'offsetHeight', { value: 0 });

        highlighter.toggle();
        _click(firstHeader);
        _click(firstText);
        // Auto-select should choose all elements with `row` class, but not the hidden ones
        _checkWholeDOM([
            firstHeader, firstText, secondHeader, secondText,
            secondDiv, thirdDiv, firstSocialButtons,
            secondSocialButtons, firstRowSpan, secondRowSpan
        ]);
    });
})
