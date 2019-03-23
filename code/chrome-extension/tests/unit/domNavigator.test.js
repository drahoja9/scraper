import { DOMNavigator } from '../../src/contentScripts/domNavigator';
import { JSDOM } from 'jsdom';

// -------------------------------------------- Setup and teardown ----------------------------------------------

let navigator = new DOMNavigator();
beforeAll(async function () {
    const dom = await JSDOM.fromFile('/home/jakub/BP/code/chrome-extension/tests/unit/testingPage.html');
    document.body.innerHTML = dom.window.document.body.innerHTML;
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('returns first child of the target node, if it has some, otherwise returns the node itself', () => {
    const container = document.querySelector('#container');
    const firstDiv = document.querySelector('#first-div');
    const secondDiv = document.querySelector('#second-div');
    const article = document.querySelector('#post-1');
    const p1 = document.querySelector('#first-p');
    const p2 = document.querySelector('#second-p');
    const firstLink = document.querySelector('#first-link');

    expect(navigator.firstChild(container)).toBe(firstDiv);
    expect(navigator.firstChild(firstDiv)).toBe(secondDiv);
    expect(navigator.firstChild(secondDiv)).toBe(article);
    expect(navigator.firstChild(p1)).toBe(firstLink);
    expect(navigator.firstChild(p2)).toBe(p2);
});

test('returns parent of the target node, if it has some, otherwise returns the node itself', () => {
    const html = document.querySelector('html');
    const body = document.querySelector('body');
    const container = document.querySelector('#container');
    const firstDiv = document.querySelector('#first-div');
    const secondDiv = document.querySelector('#second-div');

    expect(navigator.parent(secondDiv)).toBe(firstDiv);
    expect(navigator.parent(firstDiv)).toBe(container);
    expect(navigator.parent(container)).toBe(body);
    expect(navigator.parent(body)).toBe(html);
    expect(navigator.parent(html)).toBe(html);
});

test('returns previous sibling of the target node, if it has some, otherwise returns the node itself', () => {
    const container = document.querySelector('#container');
    const firstDiv = document.querySelector('#first-div');
    const secondDiv = document.querySelector('#second-div');
    const thirdDiv = document.querySelector('#third-div');
    const firstImgDiv = document.querySelector('#first-img-div');
    const firstContentDiv = document.querySelector('#first-content-div');
    const thirdHiddenDiv = document.querySelector('#hidden-div-3');

    expect(navigator.previousSibling(container)).toBe(thirdHiddenDiv);
    expect(navigator.previousSibling(firstDiv)).toBe(firstDiv);
    expect(navigator.previousSibling(thirdDiv)).toBe(secondDiv);
    expect(navigator.previousSibling(firstContentDiv)).toBe(firstImgDiv);
});

test('returns next sibling of the target node, if it has some, otherwise returns the node itself', () => {
    const container = document.querySelector('#container');
    const firstDiv = document.querySelector('#first-div');
    const secondDiv = document.querySelector('#second-div');
    const thirdDiv = document.querySelector('#third-div');
    const firstImgDiv = document.querySelector('#first-img-div');
    const firstContentDiv = document.querySelector('#first-content-div');
    const script = document.querySelector('#script');

    expect(navigator.nextSibling(container)).toBe(script);
    expect(navigator.nextSibling(firstDiv)).toBe(firstDiv);
    expect(navigator.nextSibling(secondDiv)).toBe(thirdDiv);
    expect(navigator.nextSibling(firstImgDiv)).toBe(firstContentDiv);
});
