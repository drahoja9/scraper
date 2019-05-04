import { UndoRedoStore } from '/src/contentScripts/selectEngine/undoRedoStore.js';
import { Messages } from "/src/constants.js";
import { SelectionMockup } from "../../mocks.js";


// -------------------------------------------- Setup and teardown ----------------------------------------------

let selection;
let undoRedoStore;

beforeEach(async function () {
    selection = new SelectionMockup();
    undoRedoStore = new UndoRedoStore(selection);
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('adding selection to undo store', () => {
    const elementWithId = { id: 'unique-id-1' };
    const elementWithoutId = { id: undefined };
    undoRedoStore._redos = [1, 2, 3, 4];

    undoRedoStore.pushUndo([elementWithId, elementWithoutId]);
    expect(undoRedoStore._undos).toEqual(['#unique-id-1,#scraping-0']);
    expect(selection.notifyController.mock.calls.length).toBe(2);
    expect(selection.notifyController.mock.calls[0][0]).toEqual({ msg: Messages.ENABLE_UNDO });
    expect(selection.notifyController.mock.calls[1][0]).toEqual({ msg: Messages.DISABLE_REDO });
    expect(undoRedoStore._redos).toEqual([]);
});

test('check if there is something to undo', () => {
    undoRedoStore.checkUndo();
    expect(selection.notifyController.mock.calls.length).toBe(1);
    expect(selection.notifyController.mock.calls[0][0]).toEqual({ msg: Messages.DISABLE_UNDO });

    undoRedoStore.pushUndo([{ id: 'some-element' }]);
    undoRedoStore.checkUndo();
    expect(selection.notifyController.mock.calls.length).toBe(4);
    expect(selection.notifyController.mock.calls[0][0]).toEqual({ msg: Messages.DISABLE_UNDO });
    expect(selection.notifyController.mock.calls[1][0]).toEqual({ msg: Messages.ENABLE_UNDO });
    expect(selection.notifyController.mock.calls[2][0]).toEqual({ msg: Messages.DISABLE_REDO });
    expect(selection.notifyController.mock.calls[3][0]).toEqual({ msg: Messages.ENABLE_UNDO });
});

test('check if there is something to redo', () => {
    undoRedoStore.checkRedo();
    expect(selection.notifyController.mock.calls.length).toBe(1);
    expect(selection.notifyController.mock.calls[0][0]).toEqual({ msg: Messages.DISABLE_REDO });

    undoRedoStore.pushUndo([{ id: 'some-element' }]);
    undoRedoStore.undo();
    undoRedoStore.checkRedo();
    expect(selection.notifyController.mock.calls.length).toBe(6);
    expect(selection.notifyController.mock.calls[0][0]).toEqual({ msg: Messages.DISABLE_REDO });
    expect(selection.notifyController.mock.calls[1][0]).toEqual({ msg: Messages.ENABLE_UNDO });
    expect(selection.notifyController.mock.calls[2][0]).toEqual({ msg: Messages.DISABLE_REDO });
    expect(selection.notifyController.mock.calls[3][0]).toEqual({ msg: Messages.DISABLE_UNDO });
    expect(selection.notifyController.mock.calls[4][0]).toEqual({ msg: Messages.ENABLE_REDO });
    expect(selection.notifyController.mock.calls[5][0]).toEqual({ msg: Messages.ENABLE_REDO });
});

test('undoing single action', () => {
    const elem1 = { id: 'elem-1' };
    const elem2 = { id: undefined };

    undoRedoStore.pushUndo([elem1]);
    undoRedoStore.pushUndo([elem2]);

    undoRedoStore.undo();
    expect(undoRedoStore._undos).toEqual(['#elem-1']);
    expect(undoRedoStore._redos).toEqual(['#scraping-0']);
    expect(selection.notifyController.mock.calls.length).toBe(6);
    expect(selection.notifyController.mock.calls[4][0]).toEqual({ msg: Messages.ENABLE_UNDO });
    expect(selection.notifyController.mock.calls[5][0]).toEqual({ msg: Messages.ENABLE_REDO });

    undoRedoStore.undo();
    expect(undoRedoStore._undos).toEqual([]);
    expect(undoRedoStore._redos).toEqual(['#scraping-0', '#elem-1']);
    expect(selection.notifyController.mock.calls.length).toBe(8);
    expect(selection.notifyController.mock.calls[6][0]).toEqual({ msg: Messages.DISABLE_UNDO });
    expect(selection.notifyController.mock.calls[7][0]).toEqual({ msg: Messages.ENABLE_REDO });
});

test('undoing multiple action', () => {
    const elem1 = { id: 'elem-1' };
    const elem2 = { id: undefined };
    const elem3 = {};

    undoRedoStore.pushUndo([elem1, elem2, elem3]);

    undoRedoStore.undo();
    expect(undoRedoStore._undos).toEqual([]);
    expect(undoRedoStore._redos).toEqual(['#elem-1,#scraping-0,#scraping-1']);
    expect(selection.notifyController.mock.calls.length).toBe(4);
    expect(selection.notifyController.mock.calls[2][0]).toEqual({ msg: Messages.DISABLE_UNDO });
    expect(selection.notifyController.mock.calls[3][0]).toEqual({ msg: Messages.ENABLE_REDO });
});

test('try undoing with no action', () => {
    undoRedoStore.undo();
    expect(undoRedoStore._undos).toEqual([]);
    expect(undoRedoStore._redos).toEqual([]);
    expect(selection.notifyController.mock.calls.length).toBe(0);
});

test('redoing single action', () => {
    const elem1 = { id: 'elem-1' };
    const elem2 = { id: undefined };

    undoRedoStore.pushUndo([elem1]);
    undoRedoStore.pushUndo([elem2]);
    undoRedoStore.undo();
    undoRedoStore.undo();

    undoRedoStore.redo();
    expect(undoRedoStore._undos).toEqual(['#elem-1']);
    expect(undoRedoStore._redos).toEqual(['#scraping-0']);
    expect(selection.notifyController.mock.calls.length).toBe(10);
    expect(selection.notifyController.mock.calls[8][0]).toEqual({ msg: Messages.ENABLE_REDO });
    expect(selection.notifyController.mock.calls[9][0]).toEqual({ msg: Messages.ENABLE_UNDO });

    undoRedoStore.redo();
    expect(undoRedoStore._undos).toEqual(['#elem-1', '#scraping-0']);
    expect(undoRedoStore._redos).toEqual([]);
    expect(selection.notifyController.mock.calls.length).toBe(12);
    expect(selection.notifyController.mock.calls[10][0]).toEqual({ msg: Messages.DISABLE_REDO });
    expect(selection.notifyController.mock.calls[11][0]).toEqual({ msg: Messages.ENABLE_UNDO });
});

test('redoing multiple action', () => {
    const elem1 = { id: 'elem-1' };
    const elem2 = { id: undefined };
    const elem3 = {};

    undoRedoStore.pushUndo([elem1, elem2, elem3]);
    undoRedoStore.undo();

    undoRedoStore.redo();
    expect(undoRedoStore._undos).toEqual(['#elem-1,#scraping-0,#scraping-1']);
    expect(undoRedoStore._redos).toEqual([]);
    expect(selection.notifyController.mock.calls.length).toBe(6);
    expect(selection.notifyController.mock.calls[4][0]).toEqual({ msg: Messages.DISABLE_REDO });
    expect(selection.notifyController.mock.calls[5][0]).toEqual({ msg: Messages.ENABLE_UNDO });
});

test('try redoing with no action', () => {
    undoRedoStore.redo();
    expect(undoRedoStore._undos).toEqual([]);
    expect(undoRedoStore._redos).toEqual([]);
    expect(selection.notifyController.mock.calls.length).toBe(0);
});
