import { DATA_PREVIEW } from '/src/constants.js';
import { PreviewTableCell } from './previewTableCell.js';
import { PreviewTableRow } from './previewTableRow.js';


export class PreviewTable {
    constructor(dataProvider) {
        this._placeholder = document.createElement('div');
        this._placeholder.id = 'scraping-data-preview';
        this._placeholder.className = 'scraping-protected';
        this._dataProvider = dataProvider;

        this._hide = this._hide.bind(this);
        this._hideFromClickAway = this._hideFromClickAway.bind(this);

        $(this._placeholder).load(chrome.runtime.getURL(DATA_PREVIEW), () => {
            this._modal = this._placeholder.firstElementChild;
            const closeBtn = this._placeholder.querySelector('.scraping-modal-close');
            closeBtn.addEventListener('click', this._hide);
        });
    }

    inject() {
        document.querySelector('body').appendChild(this._placeholder);
    }

    display() {
        const { columnNames, rowsData } = this._dataProvider.data;
        this._fillHeader(columnNames);
        this._fillBody(columnNames, rowsData);
        this._placeholder.querySelector('.scraping-modal').style.display = 'flex';
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
        for (const [idx, row] of rowsData.entries()) {
            const removeRow = (tableRow) => {
                this._dataProvider.removeRowFrom(idx);
                tableBody.removeChild(tableRow);
            };
            tableBody.appendChild(new PreviewTableRow(columnNames, row, removeRow));
        }
    }
}
