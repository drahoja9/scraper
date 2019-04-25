import { DOMNavigaton } from "/src/contentScripts/selectEngine/selectors/domNavigation/domNavigation.js";
import { Messages } from "/src/constants.js";
import { SelectEngineMockup } from "./mocks.js";
import { _mouseenter, _mouseleave } from "./utils.js";
import { JSDOM } from 'jsdom';


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

let selector;
let selectEngine;
beforeEach(async function () {
    selectEngine = new SelectEngineMockup();
    selector = new DOMNavigaton(selectEngine);
    const dom = await JSDOM.fromFile('/home/jakub/BP/code/chrome-extension/tests/testingPage.html');
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

test('inject the DOM navigation', () => {
    selector.inject();
    const domNavigation = document.querySelector('.scraping-dom-navigation');
    expect(domNavigation).not.toBe(null);

    _mouseenter(domNavigation);
    expect(domNavigation.style.display).toBe('flex');

    _mouseleave(domNavigation);
    expect(domNavigation.style.display).toBe('none');
});

test('attach DOM navigation controls at correct position', () => {
    // Cannot test as the JSDOM does no real rendering
});

test('hide DOM navigation', () => {
    const firstHeader = document.querySelector('#first-header');

    selector.inject();
    const domNavigation = document.querySelector('.scraping-dom-navigation');
    _mouseenter(domNavigation);

    selector.hideControls({ target: firstHeader });
    expect(domNavigation.style.display).toBe('flex');

    selector.hideControls({ target: firstHeader }, true);
    expect(domNavigation.style.display).toBe('none');

    _mouseenter(domNavigation);

    selectEngine.select([firstHeader]);
    selector.hideControls({ target: firstHeader });
    expect(domNavigation.style.display).toBe('none');
});

test('change current selection to another element', () => {
    const firstHeader = document.querySelector('#first-header');
    const firstContentDiv = document.querySelector('#first-content-div');
    const firstImgDiv = document.querySelector('#first-img-div');
    const firstImg = document.querySelector('#first-img');
    selector.inject();

    selectEngine.select([firstHeader]);
    selector.attachControls({ target: firstHeader });
    let ensureCallback = ({ target }) => { expect(target).toBe(firstContentDiv); };
    selector.changeCurrent('parentElement', ensureCallback);
    expect(selectEngine.selected).toEqual([firstContentDiv]);

    selectEngine.select([firstImgDiv]);
    selector.attachControls({ target: firstImgDiv });
    ensureCallback = ({ target }) => { expect(target).toBe(firstContentDiv); };
    selector.changeCurrent('nextElementSibling', ensureCallback);
    expect(selectEngine.selected).toEqual([firstContentDiv]);

    // firstContentDiv was already selected so it is not unselected when moving
    // the selection elsewhere (which is correct behavior)
    ensureCallback = ({ target }) => { expect(target).toBe(firstImgDiv); };
    selector.changeCurrent('previousElementSibling', ensureCallback);
    expect(selectEngine.selected).toEqual([firstContentDiv, firstImgDiv]);

    ensureCallback = ({ target }) => { expect(target).toBe(firstImg); };
    selector.changeCurrent('firstElementChild', ensureCallback);
    expect(selectEngine.selected).toEqual([firstContentDiv, firstImg]);
});

test('skip invalid elements when changing selection', () => {
    const container = document.querySelector('#container');

    selector.inject();
    selectEngine.select([document.body]);
    selector.attachControls({ target: document.body });

    const ensureCallback = ({ target }) => { expect(target).toBe(container); };
    selector.changeCurrent('firstElementChild', ensureCallback);
    expect(selectEngine.selected).toEqual([container]);
});

test('notifying DOM navigation about selection/unselection', () => {
    const firstHeader = document.querySelector('#first-header');

    selector.inject();
    selectEngine.select([firstHeader]);
    const domNavigation = document.querySelector('.scraping-dom-navigation');

    selector.notify({ msg: Messages.SELECTED, nodes: [firstHeader] });
    _mouseenter(firstHeader);
    expect(domNavigation.style.display).toBe('flex');
    _mouseleave(firstHeader);
    expect(domNavigation.style.display).toBe('none');

    _mouseenter(firstHeader);
    selector.notify({ msg: Messages.UNSELECTED, nodes: [firstHeader] });
    expect(domNavigation.style.display).toBe('none');
    _mouseenter(firstHeader);
    expect(domNavigation.style.display).toBe('none');
});