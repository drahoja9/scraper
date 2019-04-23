import { MouseSelector } from '/src/contentScripts/selectEngine/selectors/mouseSelector.js';
import { SelectEngineMockup } from './mocks.js';
import { _click, _clickWithCtrl, _mouseover, _mouseout } from './utils.js';
import { JSDOM } from 'jsdom';


// -------------------------------------------- Setup and teardown ----------------------------------------------

let selector;
let selectEngine;
beforeEach(async function () {
    selectEngine = new SelectEngineMockup();
    selector = new MouseSelector(selectEngine);
    const dom = await JSDOM.fromFile('/home/jakub/BP/code/chrome-extension/tests/unit/testingPage.html');
    document.body.innerHTML = dom.window.document.body.innerHTML;
});

afterEach(function () {
    if (selector._isTurnedOn) {
        selector.toggle();
    }
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('toggle selector on and off', () => {
    const firstHeader = document.querySelector('#first-header');
    const highlightClass1 = 'scraping-highlighted-1';

    selector.toggle(highlightClass1);
    _mouseover(firstHeader);
    expect(firstHeader.classList.contains(highlightClass1)).toBe(true);
    _click(firstHeader);
    expect(selectEngine.selected).toEqual([firstHeader]);

    _mouseout(firstHeader);
    _click(firstHeader);

    selector.toggle(highlightClass1);
    _mouseover(firstHeader);
    expect(firstHeader.classList.contains(highlightClass1)).toBe(false);
    _click(firstHeader);
    expect(selectEngine.selected).toEqual([]);
});

test('highlight element on hover', () => {
    const firstHeader = document.querySelector('#first-header');
    const highlightClass1 = 'scraping-highlighted-1';
    const highlightClass2 = 'scraping-highlighted-2';

    selector.toggle(highlightClass1);
    _mouseover(firstHeader);
    expect(firstHeader.classList.contains(highlightClass1)).toBe(true);
    _mouseout(firstHeader);
    expect(firstHeader.classList.contains(highlightClass1)).toBe(false);

    selector.toggle();

    selector.toggle(highlightClass2);
    _mouseover(firstHeader);
    expect(firstHeader.classList.contains(highlightClass2)).toBe(true);
    _mouseout(firstHeader);
    expect(firstHeader.classList.contains(highlightClass2)).toBe(false);
});

test('select element on click, unselect on another click', () => {
    const firstRowSpan = document.querySelector('#first-row-span');

    selector.toggle();
    _click(firstRowSpan);
    expect(selectEngine.selected).toEqual([firstRowSpan]);

    _click(firstRowSpan);
    expect(selectEngine.selected).toEqual([]);

    _click(firstRowSpan);
    expect(selectEngine.selected).toEqual([firstRowSpan]);

    _click(firstRowSpan);
    expect(selectEngine.selected).toEqual([]);
});

describe('auto-select test suite', () => {
    test('auto-select all div elements with class `col`', () => {
        const firstDiv = document.querySelector('#first-div');
        const firstImgDiv = document.querySelector('#first-img-div');
        const secondImgDiv = document.querySelector('#second-img-div');
        const firstContentDiv = document.querySelector('#first-content-div');
        const secondContentDiv = document.querySelector('#second-content-div');
        const firstSpanDiv = document.querySelector('#first-span-div');
        const secondSpanDiv = document.querySelector('#second-span-div');

        selector.toggle();
        _click(firstDiv);
        _clickWithCtrl(secondImgDiv);
        expect(selectEngine.selected).toEqual([
            firstDiv, secondImgDiv, firstImgDiv, firstContentDiv,
            firstSpanDiv, secondContentDiv, secondSpanDiv
        ]);
    });

    test('auto-select all elements with data-attribute `332`', () => {
        const firstImgDiv = document.querySelector('#first-img-div');
        const firstLike = document.querySelector('#first-like');
        const secondText = document.querySelector('#second-text');

        selector.toggle();
        _click(firstImgDiv);
        _clickWithCtrl(firstLike);
        expect(selectEngine.selected).toEqual([firstImgDiv, firstLike, secondText]);
    });

    test('auto-select all elements with HTML tag `<td>`', () => {
        const tds = document.querySelectorAll('td');

        selector.toggle();
        _click(tds[0]);
        _clickWithCtrl(tds[1]);
        expect(selectEngine.selected).toEqual(Array.from(tds));
    });

    test('auto-select only with Ctrl key pressed', () => {
        const firstDiv = document.querySelector('#first-div');
        const firstImgDiv = document.querySelector('#first-img-div');
        const secondSpanDiv = document.querySelector('#second-span-div');

        selector.toggle();
        _click(firstDiv);
        _click(firstImgDiv);
        _click(secondSpanDiv);
        expect(selectEngine.selected).toEqual([firstDiv, firstImgDiv, secondSpanDiv]);
    });

    test('no auto-select on first click', () => {
        const firstDiv = document.querySelector('#first-div');

        selector.toggle();
        _click(firstDiv);
        expect(selectEngine.selected).toEqual([firstDiv]);
    });

    test('no auto-select when unselecting element', () => {
        const firstDiv = document.querySelector('#first-div');
        const firstImgDiv = document.querySelector('#first-img-div');

        selector.toggle();
        _click(firstDiv);
        _click(firstImgDiv);
        _clickWithCtrl(firstDiv);
        expect(selectEngine.selected).toEqual([firstImgDiv]);
    });

    test('no auto-select when only div or span', () => {
        const firstDiv = document.querySelector('#first-div');
        const secondDiv = document.querySelector('#second-div');
        const firstLike = document.querySelector('#first-like');
        const firstRowSpan = document.querySelector('#first-row-span');

        selector.toggle();
        _click(firstDiv);
        _clickWithCtrl(secondDiv);
        expect(selectEngine.selected).toEqual([firstDiv, secondDiv]);

        _clickWithCtrl(firstLike);
        _clickWithCtrl(firstRowSpan);
        expect(selectEngine.selected).toEqual([firstDiv, secondDiv, firstLike, firstRowSpan]);
    });
});
