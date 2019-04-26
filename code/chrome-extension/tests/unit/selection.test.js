import { ColumnSelection, RowSelection } from "/src/contentScripts/selectEngine/selection.js";
import { Messages } from "/src/constants.js";
import { ControllerMockup, DOMNavigationMockup, SelectEngineMockup, UndoRedoStoreMockup } from "./mocks.js";
import { JSDOM } from 'jsdom';


// -------------------------------------------- Setup and teardown ----------------------------------------------

beforeAll(function () {
    // Mocking the `offsetWidth` and `offsetHeight`
    Object.defineProperty(window.HTMLElement.prototype, 'offsetWidth', {
        get: function () {
            return this._customOffsetWidth !== undefined ? this._customOffsetWidth : 123;
        }
    });
    Object.defineProperty(window.HTMLElement.prototype, 'offsetHeight', {
        get: function () {
            return this._customOffsetHeight !== undefined ? this._customOffsetHeight : 123;
        }
    });
});

let rowSelection;
let colSelection;
let controller;
let domNavigation;
let undoRedoStore;
let selectEngine;

beforeEach(async function () {
    controller = new ControllerMockup();
    domNavigation = new DOMNavigationMockup();
    selectEngine = new SelectEngineMockup();
    undoRedoStore = new UndoRedoStoreMockup();
    rowSelection = new RowSelection(controller, domNavigation, selectEngine);
    colSelection = new ColumnSelection(controller, domNavigation, 0, selectEngine);
    rowSelection._undoRedoStore = undoRedoStore;
    colSelection._undoRedoStore = undoRedoStore;
    const dom = await JSDOM.fromFile('/home/jakub/BP/code/chrome-extension/tests/testingPage.html');
    document.body.innerHTML = dom.window.document.body.innerHTML;
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('select rows', () => {
    const firstLike = document.querySelector('#first-like');
    const secondLike = document.querySelector('#second-like');

    const classes1 = rowSelection.classes;
    rowSelection._updateClasses(rowSelection._rowId + 1);
    const classes2 = rowSelection.classes;
    rowSelection._updateClasses(rowSelection._rowId - 1);

    rowSelection.select([firstLike, secondLike]);
    classes1.map(cls => {
        expect(firstLike.classList.contains(cls)).toBe(true);
    });
    classes2.map(cls => {
        expect(secondLike.classList.contains(cls)).toBe(true);
    });
    expect(controller.invalidateData.mock.calls.length).toBe(1);
    expect(domNavigation.notify.mock.calls.length).toBe(1);
    expect(domNavigation.notify.mock.calls[0][0]).toEqual(
        { msg: Messages.SELECTED, nodes: [firstLike, secondLike] }
    );
    expect(undoRedoStore.pushUndo.mock.calls.length).toBe(1);
    expect(undoRedoStore.pushUndo.mock.calls[0][0]).toEqual([firstLike, secondLike]);
});

test('try select already selected', () => {
    const firstLike = document.querySelector('#first-like');
    const secondLike = document.querySelector('#second-like');
    const classes = colSelection.classes;
    firstLike.className = ' ' + classes.join(' ');
    secondLike.className = ' ' + classes.join(' ');

    colSelection.select([firstLike, secondLike]);
    classes.map(cls => {
        expect(firstLike.classList.contains(cls)).toBe(true);
    });
    classes.map(cls => {
        expect(secondLike.classList.contains(cls)).toBe(true);
    });
    expect(controller.invalidateData.mock.calls.length).toBe(0);
    expect(domNavigation.notify.mock.calls.length).toBe(0);
    expect(undoRedoStore.pushUndo.mock.calls.length).toBe(0);
});

test('try select invalid', () => {
    const script = document.querySelector('#script');
    const hiddenDiv = document.querySelector('#hidden-div-1');
    const classes = colSelection.classes;

    colSelection.select([script, hiddenDiv]);
    classes.map(cls => {
        expect(script.classList.contains(cls)).toBe(false);
    });
    classes.map(cls => {
        expect(hiddenDiv.classList.contains(cls)).toBe(false);
    });
    expect(controller.invalidateData.mock.calls.length).toBe(0);
    expect(domNavigation.notify.mock.calls.length).toBe(0);
    expect(undoRedoStore.pushUndo.mock.calls.length).toBe(0);
});

test('unselect columns', () => {
    const firstLike = document.querySelector('#first-like');
    const secondLike = document.querySelector('#second-like');
    const classes = colSelection.classes;
    firstLike.className = ' ' + classes.join(' ');
    secondLike.className = ' ' + classes.join(' ');

    colSelection.unselect([firstLike, secondLike]);
    classes.map(cls => {
        expect(firstLike.classList.contains(cls)).toBe(false);
    });
    classes.map(cls => {
        expect(secondLike.classList.contains(cls)).toBe(false);
    });
    expect(controller.invalidateData.mock.calls.length).toBe(1);
    expect(domNavigation.notify.mock.calls.length).toBe(1);
    expect(domNavigation.notify.mock.calls[0][0]).toEqual(
        { msg: Messages.UNSELECTED, nodes: [firstLike, secondLike] }
    );
    expect(undoRedoStore.pushUndo.mock.calls.length).toBe(1);
    expect(undoRedoStore.pushUndo.mock.calls[0][0]).toEqual([firstLike, secondLike]);
});

test('unselect rows', () => {
    const firstLike = document.querySelector('#first-like');
    const secondLike = document.querySelector('#second-like');
    const classes1 = rowSelection.classes;
    rowSelection._updateClasses(153);
    const classes2 = rowSelection.classes;
    rowSelection._updateClasses(-3820);
    firstLike.className = ' ' + classes1.join(' ');
    secondLike.className = ' ' + classes2.join(' ');
    rowSelection._updateClasses(999);

    rowSelection.unselect([firstLike, secondLike]);
    classes1.map(cls => {
        expect(firstLike.classList.contains(cls)).toBe(false);
    });
    classes2.map(cls => {
        expect(secondLike.classList.contains(cls)).toBe(false);
    });
    expect(controller.invalidateData.mock.calls.length).toBe(1);
    expect(domNavigation.notify.mock.calls.length).toBe(1);
    expect(domNavigation.notify.mock.calls[0][0]).toEqual(
        { msg: Messages.UNSELECTED, nodes: [firstLike, secondLike] }
    );
    expect(undoRedoStore.pushUndo.mock.calls.length).toBe(1);
    expect(undoRedoStore.pushUndo.mock.calls[0][0]).toEqual([firstLike, secondLike]);
    expect(rowSelection.classes).toEqual(['scraping-selected-row', 'scraping-row-999']);
});

test('toggle selection', () => {
    const firstLike = document.querySelector('#first-like');
    const secondLike = document.querySelector('#second-like');
    const classes = colSelection.classes;

    colSelection.toggle([firstLike, secondLike]);
    classes.map(cls => {
        expect(secondLike.classList.contains(cls)).toBe(true);
    });
    expect(controller.invalidateData.mock.calls.length).toBe(1);
    expect(domNavigation.notify.mock.calls.length).toBe(1);
    expect(domNavigation.notify.mock.calls[0][0]).toEqual(
        { msg: Messages.SELECTED, nodes: [firstLike, secondLike] }
    );
    expect(undoRedoStore.pushUndo.mock.calls.length).toBe(1);
    expect(undoRedoStore.pushUndo.mock.calls[0][0]).toEqual([firstLike, secondLike]);

    colSelection.toggle([firstLike, secondLike]);
    classes.map(cls => {
        expect(secondLike.classList.contains(cls)).toBe(false);
    });
    expect(controller.invalidateData.mock.calls.length).toBe(2);
    expect(domNavigation.notify.mock.calls.length).toBe(2);
    expect(domNavigation.notify.mock.calls[1][0]).toEqual(
        { msg: Messages.UNSELECTED, nodes: [firstLike, secondLike] }
    );
    expect(undoRedoStore.pushUndo.mock.calls.length).toBe(2);
    expect(undoRedoStore.pushUndo.mock.calls[1][0]).toEqual([firstLike, secondLike]);
});

test('whether rows are selected or not', () => {
    const firstLike = document.querySelector('#first-like');
    const secondLike = document.querySelector('#second-like');
    const classes = rowSelection.classes;
    firstLike.className += ' ' + classes.join(' ');
    rowSelection.classes = ['scraping-selected-row', 'scraping-row-999'];
    rowSelection._rowId = 999;

    expect(rowSelection.areSelected([firstLike])).toBe(true);
    expect(rowSelection.areSelected([secondLike])).toBe(false);
    expect(rowSelection.areSelected([firstLike, secondLike])).toBe(false);

    secondLike.className += ' ' + classes.join(' ');
    expect(rowSelection.areSelected([firstLike, secondLike])).toBe(true);

    expect(rowSelection.classes).toEqual(['scraping-selected-row', 'scraping-row-999']);
});

test('undo', () => {
    expect(undoRedoStore.undo.mock.calls.length).toBe(0);
    colSelection.undo();
    expect(undoRedoStore.undo.mock.calls.length).toBe(1);
});

test('redo', () => {
    expect(undoRedoStore.redo.mock.calls.length).toBe(0);
    rowSelection.redo();
    expect(undoRedoStore.redo.mock.calls.length).toBe(1);
});

test('check undo/redo', () => {
    expect(undoRedoStore.checkUndo.mock.calls.length).toBe(0);
    expect(undoRedoStore.checkRedo.mock.calls.length).toBe(0);
    colSelection.checkUndoRedo();
    expect(undoRedoStore.checkUndo.mock.calls.length).toBe(1);
    expect(undoRedoStore.checkRedo.mock.calls.length).toBe(1);
});

test('generate ID', () => {
    expect(rowSelection.generateId()).toEqual('scraping-1');
    expect(colSelection.generateId()).toEqual('scraping-2');
    expect(rowSelection.generateId()).toEqual('scraping-3');
    expect(colSelection.generateId()).toEqual('scraping-4');
    expect(colSelection.generateId()).toEqual('scraping-5');
});

test('is selecting rows', () => {
    expect(rowSelection.isSelectingRows).toBe(true);
    expect(colSelection.isSelectingRows).toBe(false);
});

test('get column ID', () => {
    const firstLike = document.querySelector('#first-like');
    colSelection._updateClasses(123);
    firstLike.className += ' ' + colSelection.classes.join(' ');
    colSelection._updateClasses(98732);

    expect(colSelection.getColId(firstLike)).toEqual('123');
});

test('activate column', () => {
    const firstLike = document.querySelector('#first-like');
    const secondLike = document.querySelector('#second-like');

    firstLike.className += ' ' + colSelection.classes.join(' ');
    secondLike.className += ' scraping-active';

    colSelection.activateColumn();
    expect(firstLike.classList.contains('scraping-active')).toBe(true);
    expect(secondLike.classList.contains('scraping-active')).toBe(false);
});
