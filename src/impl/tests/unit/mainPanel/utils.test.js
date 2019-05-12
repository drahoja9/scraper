import { registerHandler, registerInputHandler } from '/src/mainPanel/utils.js';
import { JSDOM } from 'jsdom';
import { MAIN_PANEL_PAGE } from '/src/constants.js';
import { _click, _enterKeyDown, _mouseleave, _mouseover, insertMainPanelScripts } from "../../utils.js";


// -------------------------------------------- Setup and teardown ----------------------------------------------

// Need to get this function from inside an iframe to test the `window.parent.postMessage` function
let sendMessageToContentScript;

function getFunction(iframe) {
    return new Promise(resolve => {
        iframe.addEventListener('load', () => {
            insertMainPanelScripts(iframe.contentWindow.window.document);
            sendMessageToContentScript = iframe.contentWindow.window.sendMessageToContentScript;
            resolve();
        });
    });
}

beforeEach(async function () {
    const path = require('path');
    const testingPage = path.resolve(__dirname, '../../testingPage.html');
    const dom = await JSDOM.fromFile(testingPage, {
        url: 'http://localhost',
        resources: 'usable',
        runScripts: 'dangerously'
    });

    global.window.addEventListener = dom.window.addEventListener;

    const iframe = dom.window.document.createElement('iframe');
    const mainPanelPath = 'file://' + path.resolve(__dirname, '../../..' + MAIN_PANEL_PAGE);
    iframe.setAttribute('src', mainPanelPath);
    dom.window.document.body.appendChild(iframe);
    await getFunction(iframe);

    document.body.innerHTML = dom.window.document.body.innerHTML;
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('send message to content script without payload', done => {
    const message = { message: 'some random message' };
    const listener = event => {
        expect(event.data.msg).toBe(message);
        expect(event.data.payload).toBe(null);
        done();
    };

    window.addEventListener('message', listener);
    sendMessageToContentScript(message);
    window.removeEventListener('message', listener);
});

test('send message to content script with payload', done => {
    const message = { message: 'some random message' };
    const payload = { some_data: [123, 'abc', {}] };
    const listener = event => {
        expect(event.data.msg).toBe(message);
        expect(event.data.payload).toBe(payload);
        done();
    };

    window.addEventListener('message', listener);
    sendMessageToContentScript(message, payload);
    window.removeEventListener('message', listener);
});

test('correct event handling', done => {
    const container = document.querySelector('#container');
    const message = { message: 'some random message' };
    const payload = { some_data: [123, 'abc', {}] };
    const callback = event => {
        expect(event.target).toBe(container);
        done();
    };

    global.window.parent.postMessage = jest.fn((msg, origin) => {
        expect(msg.msg).toBe(message);
        expect(msg.payload).toBe(payload);
        expect(origin).toEqual('*');
    });
    registerHandler(container, 'click', message, callback, () => payload);
    _click(container);
    expect(window.parent.postMessage.mock.calls.length).toBe(1);

    global.window.parent.postMessage = jest.fn((msg, origin) => {
        expect(msg.msg).toBe(message);
        expect(msg.payload).toBe(null);
        expect(origin).toEqual('*');
    });
    registerHandler(container, 'mouseover', message, callback);
    _mouseover(container);
    expect(window.parent.postMessage.mock.calls.length).toBe(1);

    registerHandler(container, 'mouseleave', message);
    _mouseleave(container);
    expect(window.parent.postMessage.mock.calls.length).toBe(2);
});

test('correct input event handling without exact check', () => {
    const input = document.querySelector('#text-input');
    const message = { message: 'some random message' };
    const value = '123 456';

    global.window.parent.postMessage = jest.fn((msg, origin) => {
        expect(msg.msg).toBe(message);
        expect(msg.payload).toEqual({ value, exact: null });
        expect(origin).toEqual('*');
    });

    registerInputHandler(input, message);
    input.value = value;
    _enterKeyDown(input);
    expect(input.value).toEqual(value);
    expect(input.value).not.toEqual(value + '\n');
    expect(window.parent.postMessage.mock.calls.length).toBe(1);
});

test('correct input event handling with exact check', () => {
    const input = document.querySelector('#text-input');
    const message = { message: 'some random message' };
    const value = '123 456';
    let exactCheck = { checked: true };

    global.window.parent.postMessage = jest.fn((msg, origin) => {
        expect(msg.msg).toBe(message);
        expect(msg.payload).toEqual({ value, exact: exactCheck.checked });
        expect(origin).toEqual('*');
    });

    registerInputHandler(input, message, exactCheck);
    input.value = value;
    _enterKeyDown(input);
    expect(input.value).toEqual(value);
    expect(input.value).not.toEqual(value + '\n');
    expect(window.parent.postMessage.mock.calls.length).toBe(1);
});