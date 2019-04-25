import { UndoRedoStore } from '/src/contentScripts/selectEngine/undoRedoStore.js';
import { Messages } from "/src/constants.js";
import { ControllerMockup, SelectionMockup } from "./mocks.js";


// -------------------------------------------- Setup and teardown ----------------------------------------------

let controller;
let selection;
let undoRedoStore;

beforeEach(async function () {
    controller = new ControllerMockup();
    selection = new SelectionMockup();
    undoRedoStore = new UndoRedoStore(controller, selection);
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('adding selection to undo store', () => {
    const elementWithId = { id: 'unique-id-1' };
    const elementWithoutId = { id: undefined };
    undoRedoStore._redos = [1, 2, 3, 4];

    undoRedoStore.pushUndo([elementWithId, elementWithoutId]);
    expect(undoRedoStore._undos).toEqual(['#unique-id-1,#scraping-0']);
    expect(controller.msg).toEqual([Messages.ENABLE_UNDO, Messages.DISABLE_REDO]);
    expect(undoRedoStore._redos).toEqual([]);
});

test('check if there is something to undo', () => {
    undoRedoStore.checkUndo();
    expect(controller.msg).toEqual([Messages.DISABLE_UNDO]);

    undoRedoStore.pushUndo([{ id: 'some-element' }]);
    undoRedoStore.checkUndo();
    expect(controller.msg).toEqual([
        Messages.DISABLE_UNDO, Messages.ENABLE_UNDO,
        Messages.DISABLE_REDO, Messages.ENABLE_UNDO
    ]);
});

test('check if there is something to redo', () => {
    undoRedoStore.checkRedo();
    expect(controller.msg).toEqual([Messages.DISABLE_REDO]);

    undoRedoStore.pushUndo([{ id: 'some-element' }]);
    undoRedoStore.undo();
    undoRedoStore.checkRedo();
    expect(controller.msg).toEqual([
        Messages.DISABLE_REDO, Messages.ENABLE_UNDO,
        Messages.DISABLE_REDO, Messages.DISABLE_UNDO,
        Messages.ENABLE_REDO, Messages.ENABLE_REDO
    ]);
});

test('undoing single action', () => {
    const elem1 = { id: 'elem-1' };
    const elem2 = { id: undefined };

    undoRedoStore.pushUndo([elem1]);
    undoRedoStore.pushUndo([elem2]);
    controller.msg = [];

    undoRedoStore.undo();
    expect(undoRedoStore._undos).toEqual(['#elem-1']);
    expect(undoRedoStore._redos).toEqual(['#scraping-0']);
    expect(controller.msg).toEqual([
        Messages.ENABLE_UNDO, Messages.ENABLE_REDO
    ]);

    controller.msg = [];
    undoRedoStore.undo();
    expect(undoRedoStore._undos).toEqual([]);
    expect(undoRedoStore._redos).toEqual(['#scraping-0', '#elem-1']);
    expect(controller.msg).toEqual([
        Messages.DISABLE_UNDO, Messages.ENABLE_REDO
    ]);
});

test('undoing multiple action', () => {
    const elem1 = { id: 'elem-1' };
    const elem2 = { id: undefined };
    const elem3 = {};

    undoRedoStore.pushUndo([elem1, elem2, elem3]);
    controller.msg = [];

    undoRedoStore.undo();
    expect(undoRedoStore._undos).toEqual([]);
    expect(undoRedoStore._redos).toEqual(['#elem-1,#scraping-0,#scraping-1']);
    expect(controller.msg).toEqual([
        Messages.DISABLE_UNDO, Messages.ENABLE_REDO
    ]);
});

test('try undoing with no action', () => {
    undoRedoStore.undo();
    expect(undoRedoStore._undos).toEqual([]);
    expect(undoRedoStore._redos).toEqual([]);
    expect(controller.msg).toEqual([]);
});

test('redoing single action', () => {
    const elem1 = { id: 'elem-1' };
    const elem2 = { id: undefined };

    undoRedoStore.pushUndo([elem1]);
    undoRedoStore.pushUndo([elem2]);
    undoRedoStore.undo();
    undoRedoStore.undo();
    controller.msg = [];

    undoRedoStore.redo();
    expect(undoRedoStore._undos).toEqual(['#elem-1']);
    expect(undoRedoStore._redos).toEqual(['#scraping-0']);
    expect(controller.msg).toEqual([
        Messages.ENABLE_REDO, Messages.ENABLE_UNDO
    ]);

    controller.msg = [];
    undoRedoStore.redo();
    expect(undoRedoStore._undos).toEqual(['#elem-1', '#scraping-0']);
    expect(undoRedoStore._redos).toEqual([]);
    expect(controller.msg).toEqual([
        Messages.DISABLE_REDO, Messages.ENABLE_UNDO
    ]);
});

test('redoing multiple action', () => {
    const elem1 = { id: 'elem-1' };
    const elem2 = { id: undefined };
    const elem3 = {};

    undoRedoStore.pushUndo([elem1, elem2, elem3]);
    undoRedoStore.undo();
    controller.msg = [];

    undoRedoStore.redo();
    expect(undoRedoStore._undos).toEqual(['#elem-1,#scraping-0,#scraping-1']);
    expect(undoRedoStore._redos).toEqual([]);
    expect(controller.msg).toEqual([
        Messages.DISABLE_REDO, Messages.ENABLE_UNDO
    ]);
});

test('try redoing with no action', () => {
    undoRedoStore.redo();
    expect(undoRedoStore._undos).toEqual([]);
    expect(undoRedoStore._redos).toEqual([]);
    expect(controller.msg).toEqual([]);
});
