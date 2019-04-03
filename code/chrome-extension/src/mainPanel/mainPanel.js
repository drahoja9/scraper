import { Messages } from '../constants.js';
import { ColumnPool } from './columnPool.js';
import { registerClickHandler, registerInputHandler, sendMessageToContentScript } from './utils.js';


function toggleAutoselectConfirmation({ shouldEnable }) {
    const alert = document.querySelector('#auto-select-alert');
    const acceptAutoSelectBtn = document.querySelector('#accept-auto-select');
    const rejectAutoSelectBtn = document.querySelector('#reject-auto-select');

    if (shouldEnable !== undefined) {
        acceptAutoSelectBtn.disabled = !shouldEnable;
        rejectAutoSelectBtn.disabled = !shouldEnable;
        if (shouldEnable) {
            alert.classList.add('show');
        } else {
            alert.classList.remove('show');
        }
    } else if (acceptAutoSelectBtn.disabled) {
        acceptAutoSelectBtn.disabled = false;
        rejectAutoSelectBtn.disabled = false;
        alert.classList.add('show');
    } else {
        acceptAutoSelectBtn.disabled = true;
        rejectAutoSelectBtn.disabled = true;
        alert.classList.remove('show');
    }
}


class RowsColsSwitcher {
    constructor(colsPool) {
        const rowsBtn = document.querySelector('#rows-btn');
        const colsBtn = document.querySelector('#cols-btn');
        this._colsPool = colsPool;
        this._active = rowsBtn;

        registerClickHandler(rowsBtn, Messages.SELECTING_ROWS, this._switch.bind(this));
        registerClickHandler(colsBtn, Messages.SELECTING_COLS, this._switch.bind(this));
    }

    _switch(event) {
        if (event.currentTarget === this._active) return;

        this._active.classList.remove('active');
        this._active = event.currentTarget;
        this._active.classList.add('active');

        this._colsPool.toggle();
    }
}


class DataPreview {
    constructor({ columnNames, data }) {
        const tableHeader = document.querySelector('#table-header');
        const tableBody = document.querySelector('#table-body');

        for (const colName of columnNames) {
            let col = document.createElement('th');
            col.innerText = colName;
            tableHeader.appendChild(col);
        }

        for (const rowData of data) {
            let row = document.createElement('tr');
            for (const colName of columnNames) {
                let cell = document.createElement('td');
                cell.innerText = rowData[colName];
                row.appendChild(cell);
            }
            tableBody.appendChild(row);
        }
    }
}


// ========================================================================================================


$(function () {
    const selectElementsBtn = document.querySelector('#select-elements-btn');

    const acceptAutoSelectBtn = document.querySelector('#accept-auto-select');
    const rejectAutoSelectBtn = document.querySelector('#reject-auto-select');

    const textSearchContainsInput = document.querySelector('#text-search-contains');
    const containsExactCheck = document.querySelector('#contains-exact');
    const textSearchStartsInput = document.querySelector('#text-search-starts');
    const textSearchEndsInput = document.querySelector('#text-search-ends');

    const downloadBtn = document.querySelector('#download-btn');

    const colsPool = new ColumnPool();
    const switcher = new RowsColsSwitcher(colsPool);
    // const dataPreview = new DataPreview(
    //     ['Name', 'Desc', 'Price'],
    //     [
    //         {
    //             'Name': 'Apple Watch',
    //             'Desc': 'Chytré hodinky - OLED Retina displej s technologií Force Touch s Ion-X sklem, dvoujádrový procesor s čipem W2, hliníkové pouzdro s kompozitní zadní stranou, Digital Crown, snímač tepové frekvence, WiFi, GPS, Bluetooth 4.2, voděodolné dle 50M, výdrž baterie až 18 hodin, watchOS 4',
    //             'Price': 11299
    //         },
    //         {
    //             'Name': 'Niceboy X-fit GPS',
    //             'Desc': 'Fitness náramek - měření tepové frekvence ze zápěstí, monitoring spánku, krokoměr, měření vzdálenosti, kompatibilita s telefony (Android, iOS), odolné vůči prachu a zvýšené vlhkosti (déšť), GPS',
    //             'Price': 1655
    //         },
    //         {
    //             'Name': 'Xiaomi Amazfit Verge Grey',
    //             'Desc': 'Chytré hodinky s integrovanou GPS, 1.2GHz dvoujádrový procesor, RAM 512MB, ROM 4GB, Wifi, Amoled Display 1.3” s rozlišením 360x360 pixelů, vodotěsnost, 12 sportovních režimů, mikrofon + reproduktor, kompatibilní s IOS 9.0 a vyšší/ Android 4.4 a vyšší.',
    //             'Price': 3476
    //         }
    //     ]
    // );

    toggleAutoselectConfirmation({});

    registerClickHandler(selectElementsBtn, Messages.SELECTING_ELEMENTS, () => { selectElementsBtn.classList.toggle('toggled-btn'); })
    registerClickHandler(acceptAutoSelectBtn, Messages.ACCEPT_AUTO_SELECT, toggleAutoselectConfirmation)
    registerClickHandler(rejectAutoSelectBtn, Messages.REJECT_AUTO_SELECT, toggleAutoselectConfirmation)
    registerInputHandler(
        textSearchContainsInput,
        Messages.TEXT_SEARCH_CONTAINS,
        containsExactCheck
    );
    registerInputHandler(
        textSearchStartsInput,
        Messages.TEXT_SEARCH_STARTS
    );
    registerInputHandler(
        textSearchEndsInput,
        Messages.TEXT_SEARCH_ENDS
    );
    registerClickHandler(downloadBtn, '', () => {
        sendMessageToContentScript(Messages.ASSEMBLE_PREVIEW, { cols: colsPool.getCols() });
    });

    window.addEventListener('message', (event) => {
        if (event.data.type !== Messages.FROM_CONTROLLER) {
            return;
        }
        switch (event.data.msg) {
            case Messages.DECIDING_AUTO_SELECT:
                toggleAutoselectConfirmation({ shouldEnable: true });
                break;
            case Messages.DISPLAY_PREVIEW:
                const dataPreview = new DataPreview(event.data.payload)
                break;
        }
    });
});