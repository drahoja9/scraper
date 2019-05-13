import { SelectEngine } from '/src/contentScripts/selectEngine/selectEngine.js';
import { Messages } from '/src/constants.js';
import { ControllerMockup } from "../../mocks.js";
import { prepareTestPage } from "../../setup.js";


// -------------------------------------------- Setup and teardown ----------------------------------------------

let selectEngine;
let controller;

beforeEach(async function () {
    await prepareTestPage();
    controller = new ControllerMockup();
    selectEngine = new SelectEngine(controller);
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('unselect row', () => {
    const firstPost = document.querySelector('#post-1');
    const firstImg = document.querySelector('#first-img');
    const firstHeader = document.querySelector('#first-header');
    const firstText = document.querySelector('#first-text');

    firstPost.className += ' scraping-row-1';
    firstImg.className += ' scraping-selected-col scraping-col-0 scraping-active';
    firstHeader.className += ' scraping-selected-col scraping-col-1';
    firstText.className += ' scraping-selected-col scraping-col-2';

    for (const id of [0, 1, 2]) {
        selectEngine.changeCol({ colId: id });
    }
    expect(selectEngine.isSelectingRows).toBe(false);
    expect(selectEngine._currentCol).toBe(2);

    selectEngine.unselectRow({ rowId: 1 });
    expect(firstPost.classList.contains('scraping-row-1')).toBe(false);
    expect(firstImg.classList.contains('scraping-selected-col')).toBe(false);
    expect(firstImg.classList.contains('scraping-col-0')).toBe(false);
    expect(firstImg.classList.contains('scraping-active')).toBe(false);
    expect(firstHeader.classList.contains('scraping-selected-col')).toBe(false);
    expect(firstHeader.classList.contains('scraping-col-1')).toBe(false);
    expect(firstText.classList.contains('scraping-selected-col')).toBe(false);
    expect(firstText.classList.contains('scraping-col-2')).toBe(false);

    expect(selectEngine.isSelectingRows).toBe(false);
    expect(selectEngine._currentCol).toBe(2);
});

test('selecting rows', () => {
    selectEngine._mouseSelector._current = { id: 'some-element' };
    selectEngine._mouseSelector._isTurnedOn = true;

    selectEngine.selectingRows();
    expect(selectEngine._currentSelection).toBe(selectEngine._rows);
    expect(controller.notify.mock.calls.length).toBe(2);
    expect(controller.notify.mock.calls[0][0]).toEqual({ msg: Messages.DISABLE_UNDO });
    expect(controller.notify.mock.calls[1][0]).toEqual({ msg: Messages.DISABLE_REDO });
    expect(selectEngine._mouseSelector._current).toBe(undefined);
    expect(selectEngine._mouseSelector._isTurnedOn).toBe(true);
});

test('selecting columns', () => {
    selectEngine._mouseSelector._current = { id: 'some-element' };
    selectEngine._mouseSelector._isTurnedOn = true;

    selectEngine.selectingCols();
    expect(selectEngine._currentSelection).toBe(selectEngine._columns[selectEngine._currentCol]);
    expect(controller.notify.mock.calls.length).toBe(2);
    expect(controller.notify.mock.calls[0][0]).toEqual({ msg: Messages.DISABLE_UNDO });
    expect(controller.notify.mock.calls[1][0]).toEqual({ msg: Messages.DISABLE_REDO });
    expect(selectEngine._mouseSelector._current).toBe(undefined);
    expect(selectEngine._mouseSelector._isTurnedOn).toBe(true);

    selectEngine._currentCol = 1234;
    selectEngine.selectingCols();
    expect(selectEngine._currentSelection).toBe(selectEngine._columns[selectEngine._currentCol]);
    expect(Object.keys(selectEngine._columns).length).toBe(2);
});

test('each column is independent', () => {
    selectEngine.changeCol({ colId: 1 });

    expect(Object.keys(selectEngine._columns).length).toBe(2);
    expect(selectEngine._columns[0]).not.toBe(selectEngine._columns[1]);
    expect(selectEngine._columns[0]._undoRedoStore).not.toBe(selectEngine._columns[1]._undoRedoStore);

    selectEngine._columns[0]._undoRedoStore._undos.push('#123');
    expect(selectEngine._columns[0]._undoRedoStore._undos).toEqual(['#123']);
    expect(selectEngine._columns[1]._undoRedoStore._undos).toEqual([]);
});

test('change column', () => {
    selectEngine._mouseSelector._current = { id: 'some-element' };
    selectEngine._mouseSelector._isTurnedOn = true;

    expect(selectEngine._currentCol).toBe(0);
    expect(Object.keys(selectEngine._columns).length).toBe(1);

    selectEngine.changeCol({ colId: '123' });
    expect(selectEngine._currentCol).toBe(123);
    expect(selectEngine._currentSelection).toBe(selectEngine._columns[selectEngine._currentCol]);
    expect(Object.keys(selectEngine._columns).length).toBe(2);
    expect(selectEngine._mouseSelector._current).toBe(undefined);
    expect(selectEngine._mouseSelector._isTurnedOn).toBe(true);
});

test('reset mouse selector', () => {
    selectEngine._mouseSelector._current = { id: 'some-element' };
    selectEngine._mouseSelector._isTurnedOn = true;

    selectEngine.resetMouseSelector();
    expect(selectEngine._mouseSelector._current).toBe(undefined);
    expect(selectEngine._mouseSelector._isTurnedOn).toBe(true);
});

test('generate new ID for an element', () => {
    expect(selectEngine.generateId()).toEqual('scraping-1');
    expect(selectEngine.generateId()).toEqual('scraping-2');
    // ID `scraping-3` is already in the document
    const id = selectEngine.generateId();
    expect(id).not.toEqual('scraping-3');
    expect(id).toEqual('scraping-4');
    expect(selectEngine.generateId()).toEqual('scraping-5');
    expect(selectEngine.generateId()).toEqual('scraping-6');
});
