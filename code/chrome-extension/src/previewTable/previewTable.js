import { DATA_PREVIEW } from '../constants.js';
import { PreviewTableCell } from './previewTableCell.js';
import { PreviewTableRow } from './previewTableRow.js';


class PreviewTableInterface {
    init() {
        throw Error('Not implemented!');
    }

    inject() {
        throw Error('Not implemented!');
    }

    display(columnNames, rowsData) {
        throw Error('Not implemented!');
    }
}


export class PreviewTable extends PreviewTableInterface {
    constructor(controller) {
        this._placeholder = document.createElement('div');
        this._placeholder.id = 'scraping-data-preview';
        this._placeholder.className = 'scraping-protected';
        this._controller = controller;
        this._modal = undefined;

        this._hide = this._hide.bind(this);
        this._hideFromClickAway = this._hideFromClickAway.bind(this);
    }

    init() {
        return new Promise(resolve => {
            fetch(chrome.runtime.getURL(DATA_PREVIEW))
                .then(response => response.text())
                .then(html => {
                    this._placeholder.innerHTML = html;
                    this._modal = this._placeholder.firstElementChild;
                    const closeBtn = this._placeholder.querySelector('.scraping-modal-close');
                    closeBtn.addEventListener('click', this._hide);
                    resolve();
                });
        });
    }

    inject() {
        document.querySelector('body').appendChild(this._placeholder);
    }

    display(columnNames, rowsData) {
        this._fillHeader(columnNames);
        this._fillBody(columnNames, rowsData);
        this._modal.style.display = 'flex';
        window.addEventListener('click', this._hideFromClickAway);
    }

    _hide() {
        this._modal.style.display = 'none';
        this._clear();
    }

    _hideFromClickAway(event) {
        if (event.target === this._modal) {
            this._hide();
            window.removeEventListener('click', this._hideFromClickAway);
        }
    }

    _clear() {
        const tableHeader = this._placeholder.querySelector('.scraping-table-header');
        // First cell is reserved for the row remove button, we do not want to delete that
        const headerCells = Array.from(tableHeader.children).slice(1);
        for (const headerCell of headerCells) {
            tableHeader.removeChild(headerCell);
        }

        const tableBody = this._placeholder.querySelector('.scraping-table-body');
        // Need to convert the children to plain JS array in order to be able to delete
        // them while also iterating over the whole collection (this way we make copies
        // of the original live nodes)
        const allRows = Array.from(tableBody.children);
        for (const row of allRows) {
            tableBody.removeChild(row);
        }
    }

    _fillHeader(columnNames) {
        const tableHeader = this._placeholder.querySelector('.scraping-table-header');
        for (const colName of columnNames) {
            tableHeader.appendChild(new PreviewTableCell(colName));
        }
    }

    _fillBody(columnNames, rowsData) {
        const tableBody = this._placeholder.querySelector('.scraping-table-body');
        for (const row of rowsData) {
            const removeRow = (tableRow) => {
                this._controller.unselectRow(row);
                tableBody.removeChild(tableRow);
            };
            tableBody.appendChild(new PreviewTableRow(columnNames, row, removeRow));
        }
    }
}
