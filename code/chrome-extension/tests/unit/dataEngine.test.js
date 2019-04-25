import { DataEngine } from "/src/contentScripts/dataEngine/dataEngine.js";
import { JSDOM } from "jsdom";


// -------------------------------------------- Setup and teardown ----------------------------------------------

beforeAll(function () {
    Object.defineProperty(global.Element.prototype, 'innerText', {
        get: function () {
            return this.textContent.replace(/\s\s/g, '').trim()
        },
    });
});

let dataEngine;

beforeEach(async function () {
    dataEngine = new DataEngine();
    const dom = await JSDOM.fromFile('/home/jakub/BP/code/chrome-extension/tests/testingPage.html');
    document.body.innerHTML = dom.window.document.body.innerHTML;
});

// -------------------------------------------------- Tests -----------------------------------------------------

test('get data', () => {
    const columns = [
        { name: 'col-1', id: 1 },
        { name: 'col-2', id: 2 },
        { name: 'col-3', id: 3 },
    ];
    const firstPost = document.querySelector('#post-1');
    const secondPost = document.querySelector('#post-2');
    const firstImg = document.querySelector('#first-img');
    const secondImg = document.querySelector('#second-img');
    const firstHeader = document.querySelector('#first-header');
    const secondHeader = document.querySelector('#second-header');
    const firstText = document.querySelector('#first-text');
    const secondText = document.querySelector('#second-text');

    firstPost.className += ' scraping-selected-row scraping-row-1';
    firstImg.className += ' scraping-selected-col scraping-col-1 scraping-active';
    firstHeader.className += ' scraping-selected-col scraping-col-2';
    firstText.className += ' scraping-selected-col scraping-col-3';

    secondPost.className += ' scraping-selected-row scraping-row-2';
    secondImg.className += ' scraping-selected-col scraping-col-1 scraping-active';
    secondHeader.className += ' scraping-selected-col scraping-col-2';
    secondText.className += ' scraping-selected-col scraping-col-3';

    const data = dataEngine.getData(columns);
    expect(dataEngine.isDataValid).toBe(true);
    expect(data).toEqual({
        columnNames: ['col-1', 'col-2', 'col-3'],
        rowsData: [
            {
                rowId: '1',
                'col-1': 'http://localhost/icon512.png',
                'col-2': 'Article header This text should represent text child node of `first-header` div.',
                'col-3': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
                    'Suspendisse ornare ipsum vel augue sodales, non dapibus neque sodales. ' +
                    'Maecenas cursus sed sem dapibus elementum. ' +
                    'Some random latin text.'
            },
            {
                rowId: '2',
                'col-1': 'http://localhost/anonther_random_source',
                'col-2': 'Article header This text is inside a paragraph HTML tag.',
                'col-3': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
                    'Aenean luctus felis in fringilla convallis. Curabitur ut pharetra ipsum. ' +
                    'Some random latin text.'
            }
        ]
    });
});

test('export', () => {
    const columns = [
        { name: 'col-1', id: 1 },
        { name: 'col-2', id: 2 },
        { name: 'col-3', id: 3 },
    ];
    const firstPost = document.querySelector('#post-1');
    const secondPost = document.querySelector('#post-2');
    const firstImg = document.querySelector('#first-img');
    const secondImg = document.querySelector('#second-img');
    const firstHeader = document.querySelector('#first-header');
    const secondHeader = document.querySelector('#second-header');
    const firstText = document.querySelector('#first-text');
    const secondText = document.querySelector('#second-text');

    firstPost.className += ' scraping-selected-row scraping-row-1';
    firstImg.className += ' scraping-selected-col scraping-col-1 scraping-active';
    firstHeader.className += ' scraping-selected-col scraping-col-2';
    firstText.className += ' scraping-selected-col scraping-col-3';

    secondPost.className += ' scraping-selected-row scraping-row-2';
    secondImg.className += ' scraping-selected-col scraping-col-1 scraping-active';
    secondHeader.className += ' scraping-selected-col scraping-col-2';
    secondText.className += ' scraping-selected-col scraping-col-3';

    const mockCallback = jest.fn(() => 'some_generated_url');
    global.URL.createObjectURL = mockCallback;

    const { url, filename } = dataEngine.export(columns, 'json');
    expect(filename).toEqual('data.json');
    expect(url).toEqual('some_generated_url');
    expect(mockCallback.mock.calls.length).toBe(1);

    const { url: url2, filename: filename2 } = dataEngine.export(columns, 'csv');
    expect(filename2).toEqual('data.csv');
    expect(url2).toEqual('some_generated_url');
    expect(mockCallback.mock.calls.length).toBe(2);
});

test('remove row', () => {
    const columns = [
        { name: 'col-1', id: 1 },
        { name: 'col-2', id: 2 },
        { name: 'col-3', id: 3 },
    ];
    const firstPost = document.querySelector('#post-1');
    const secondPost = document.querySelector('#post-2');
    const firstImg = document.querySelector('#first-img');
    const secondImg = document.querySelector('#second-img');
    const firstHeader = document.querySelector('#first-header');
    const secondHeader = document.querySelector('#second-header');
    const firstText = document.querySelector('#first-text');
    const secondText = document.querySelector('#second-text');

    firstPost.className += ' scraping-selected-row scraping-row-1';
    firstImg.className += ' scraping-selected-col scraping-col-1 scraping-active';
    firstHeader.className += ' scraping-selected-col scraping-col-2';
    firstText.className += ' scraping-selected-col scraping-col-3';

    secondPost.className += ' scraping-selected-row scraping-row-2';
    secondImg.className += ' scraping-selected-col scraping-col-1 scraping-active';
    secondHeader.className += ' scraping-selected-col scraping-col-2';
    secondText.className += ' scraping-selected-col scraping-col-3';

    dataEngine.getData(columns);

    const row = {
        rowId: '2',
        'col-1': 'http://localhost/anonther_random_source',
        'col-2': 'Article header This text is inside a paragraph HTML tag.',
        'col-3': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
            'Aenean luctus felis in fringilla convallis. Curabitur ut pharetra ipsum. ' +
            'Some random latin text.'
    };
    dataEngine.removeRow(row);
    expect(dataEngine.getData(columns)).toEqual({
        columnNames: ['col-1', 'col-2', 'col-3'],
        rowsData: [
            {
                rowId: '1',
                'col-1': 'http://localhost/icon512.png',
                'col-2': 'Article header This text should represent text child node of `first-header` div.',
                'col-3': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
                    'Suspendisse ornare ipsum vel augue sodales, non dapibus neque sodales. ' +
                    'Maecenas cursus sed sem dapibus elementum. ' +
                    'Some random latin text.'
            }
        ]
    });
});
