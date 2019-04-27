export class SelectEngineMockup {
    constructor() {
        this.selected = [];
        this._classes = ['scraping-class-1', 'scraping-class-2'];
        this._id = 0;
    }

    areSelected(elements) {
        for (const element of elements) {
            if (!this.selected.includes(element)) {
                return false;
            }
        }
        return true;
    }

    select(elements) {
        for (const el of elements) {
            if (!this.selected.includes(el)) {
                this.selected.push(el);
            }
        }
    }

    unselect(elements) {
        for (const el of elements) {
            const idx = this.selected.indexOf(el);
            if (idx !== -1) {
                this.selected.splice(idx, 1);
            }
        }
    }

    toggle(elements) {
        if (this.areSelected(elements)) {
            this.unselect(elements);
            return false;
        } else {
            this.select(elements);
            return true;
        }
    }

    get classes() {
        return this._classes;
    }

    generateId() {
        return `scraping-${++this._id}`;
    }

    injectDomNavigation = jest.fn(() => {
    });
    unselectRow = jest.fn(rowData => {
    });
    selectingRows = jest.fn(() => {
    });
    selectingCols = jest.fn(() => {
    });
    changeCol = jest.fn(payload => {
    });
    toggleMouseSelector = jest.fn(() => {
    });
    undo = jest.fn(() => {
    });
    redo = jest.fn(() => {
    });
    contains = jest.fn(payload => {
    });
    startsWith = jest.fn(payload => {
    });
    endsWith = jest.fn(payload => {
    });
    cssSelect = jest.fn(payload => {
    });
    cssUnselect = jest.fn(() => {
    });
}


export class SelectionMockup {
    constructor() {
        this._id = 0;
    }

    toggle = jest.fn((elements, pushUndo = true) => {
    });

    generateId() {
        return `scraping-${this._id++}`;
    }
}


export class ControllerMockup {
    constructor() {
        this.isDataValid = true;
    }

    invalidateData = jest.fn(() => {
    });
    notify = jest.fn(({ msg }) => {
    });
    selectingRows = jest.fn(() => {
    });
    selectingCols = jest.fn(() => {
    });
    changeCol = jest.fn(payload => {
    });
    toggleMouseSelector = jest.fn(() => {
    });
    undo = jest.fn(() => {
    });
    redo = jest.fn(() => {
    });
    textContains = jest.fn(payload => {
    });
    textStartsWith = jest.fn(payload => {
    });
    textEndsWith = jest.fn(payload => {
    });
    cssSelect = jest.fn(payload => {
    });
    cssUnselect = jest.fn(() => {
    });
    previewData = jest.fn(payload => {
    });
    downloadData = jest.fn(payload => {
    });
    injectParts = jest.fn(() => {
    });
}


export class MainPanelControllerMockup {
    toggleMinMax = jest.fn(() => {
    });

    toggleMainPanel = jest.fn(() => {
        this.isVisible = !this.isVisible;
        this.isInjected = true;
    });
    handleInitialLoad = jest.fn((shouldBeVisible, minimized, onLeft) => {
    });
    switchSides = jest.fn(() => {
    });

    constructor() {
        this.isVisible = false;
        this.isInjected = false;
        this.iframe = {
            contentWindow: {
                postMessage: jest.fn((message, origin) => {
                })
            }
        }
    }
}


export class DOMNavigationMockup {
    notify = jest.fn(({ msg, nodes }) => {
    });
}


export class UndoRedoStoreMockup {
    pushUndo = jest.fn(elements => {
    });
    undo = jest.fn(() => {
    });
    redo = jest.fn(() => {
    });
    checkUndo = jest.fn(() => {
    });
    checkRedo = jest.fn(() => {
    });
}


export class DataEngineMockup {
    getData = jest.fn(cols => ({ columnNames: [], rowsData: [] }));
    export = jest.fn((cols, format) => ({ url: '', filename: '' }));
    removeRow = jest.fn(row => {
    });

    constructor() {
        this.isDataValid = true;
    }
}


export class PreviewTableMockup {
    inject = jest.fn(() => {
    });
    display = jest.fn((columnNames, rowsData) => {
    });
}


export class CommunicationMockup {
    toggle = jest.fn(() => {
    });
    sendMessageToBackground = jest.fn(msg => {
    });
    sendMessageToMainPanel = jest.fn(msg => {
    });
}