import { Highlighter } from '../../src/contentScripts/highlighter.js';
import { JSDOM } from 'jsdom';
import $ from 'jquery';


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

// -------------------------------------------- Setup and teardown ----------------------------------------------

beforeAll(function () {
    // Mocking the `clientWidth`, `clientHeight`, `offsetWidth` and `offsetHeight`
    const getterClientWidth = function () { return this._jsdomMockClientWidth || 123 };
    const getterClientHeight = () => this._jsdomMockClientHeight || 123;
    const getterOffsetWidth = () => this._jsdomMockOffsetWidth || 123;
    const getterOffsetHeight = () => this._jsdomMockOffsetHeight || 123;
    Object.defineProperty(window.HTMLElement.prototype, 'clientWidth', { get: getterClientWidth });
    Object.defineProperty(window.HTMLElement.prototype, 'clientHeight', { get: getterClientHeight });
    Object.defineProperty(window.HTMLElement.prototype, 'offsetWidth', { get: getterOffsetWidth });
    Object.defineProperty(window.HTMLElement.prototype, 'offsetHeight', { get: getterOffsetHeight });
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

test('tests toggling the highlighter on and off', () => {
    const container = document.querySelector('#container');

    // Mouseover event is not working for some reason -- can't test the on hover highlighting...
    highlighter.toggle();
    $(container).click();
    expect(container.classList.contains('scraping-selected')).toBe(true);

    highlighter.toggle();
    $(container).click();
    expect(container.classList.contains('scraping-selected')).toBe(true);

    highlighter.toggle();
    $(container).click();
    expect(container.classList.contains('scraping-selected')).toBe(false);
});

describe('auto-select test suite', () => {
    test('tests reject auto-select', () => {
        const firstDiv = document.querySelector('#first-div');
        const firstImgDiv = document.querySelector('#first-img-div');
        const secondImgDiv = document.querySelector('#second-img-div');
        const firstContentDiv = document.querySelector('#first-content-div');
        const secondContentDiv = document.querySelector('#second-content-div');
        const firstSpanDiv = document.querySelector('#first-span-div');
        const secondSpanDiv = document.querySelector('#second-span-div');

        highlighter.toggle();
        $(firstDiv).click();
        $(firstContentDiv).click();
        // Auto-select should choose all elements with `col` class
        _checkWholeDOM([
            firstDiv, firstContentDiv, firstImgDiv, secondImgDiv,
            secondContentDiv, firstSpanDiv, secondSpanDiv
        ]);

        highlighter.rejectAutoSelect();
        _checkWholeDOM([firstDiv, firstContentDiv]);
    });

    test('tests accept auto-select', () => {
        const firstImgDiv = document.querySelector('#first-img-div');
        const firstLike = document.querySelector('#first-like');
        const secondText = document.querySelector('#second-text');

        highlighter.toggle();
        $(firstImgDiv).click();
        $(secondText).click();
        // Auto-select should choose all elements with `data-attribute="332"` attribute
        _checkWholeDOM([firstImgDiv, secondText, firstLike]);

        highlighter.acceptAutoSelect();
        _checkWholeDOM([firstImgDiv, secondText, firstLike]);
    });

    test('tests not auto-selecting invalid elements', () => {
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
        const script = document.querySelector('#script');
        const firstHidden = document.querySelector('#hidden-div-1');
        const secondHidden = document.querySelector('#hidden-div-2');

        firstHidden.hidden = true;
        secondHidden._jsdomMockClientWidth = 0;
        secondHidden._jsdomMockClientHeight = 0;
        secondHidden._jsdomMockOffsetWidth = 0;
        secondHidden._jsdomMockOffsetHeight = 0;

        console.log(secondHidden.clientWidth);
        console.log(secondHidden.clientHeight);
        console.log(secondHidden.offsetWidth);
        console.log(secondHidden.offsetHeight);

        highlighter.toggle();
        $(firstHeader).click();
        $(firstText).click();
        _checkWholeDOM([
            firstHeader, firstText, secondHeader, secondText,
            secondDiv, thirdDiv, firstSocialButtons,
            secondSocialButtons, firstRowSpan, secondRowSpan,
            secondHidden
        ]);
    });
})
