import { DATA_PREVIEW } from '../constants.js';


export class PreviewTable {
    constructor(dataProvider) {
        this._placeholder = document.createElement('div');
        this._placeholder.id = 'scraping-data-preview';
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
        const { columnNames, data } = this._dataProvider.data;
        this._fillHeader(columnNames);
        this._fillBody(columnNames, data);
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
        for (const headerCell of Array.from(tableHeader.children).slice(1)) {
            tableHeader.removeChild(headerCell);
        }

        const tableBody = this._placeholder.querySelector('.scraping-table-body');
        for (const row of tableBody.children) {
            tableBody.removeChild(row);
        }
    }

    _fillHeader(columnNames) {
        const tableHeader = this._placeholder.querySelector('.scraping-table-header');
        for (const colName of columnNames) {
            tableHeader.appendChild(new PreviewTableCell(colName));
        }
    }

    _fillBody(columnNames, data) {
        const tableBody = this._placeholder.querySelector('.scraping-table-body');
        for (const [idx, row] of data.entries()) {
            const removeRow = (tableRow) => {
                this._dataProvider.removeRowFrom(idx);
                tableBody.removeChild(tableRow);
            };
            tableBody.appendChild(new PreviewTableRow(columnNames, row, removeRow));
        }
    }
}


class PreviewTableRow {
    constructor(columnNames, rowData, removeRow) {
        const tableRow = document.createElement('tr');
        tableRow.appendChild(new RemoveRowBtn(tableRow, removeRow));
        for (const colName of columnNames) {
            tableRow.appendChild(new PreviewTableCell(rowData[colName]));
        }

        return tableRow;
    }
}


class PreviewTableCell {
    constructor(cellText) {
        const tableCell = document.createElement('td');
        tableCell.innerText = cellText;

        return tableCell;
    }
}


class RemoveRowBtn {
    constructor(tableRow, removeRow) {
        const removeCell = document.createElement('td');
        const removeRowBtn = document.createElement('span');
        removeRowBtn.innerHTML = '&times;';
        removeRowBtn.className = 'scraping-remove-row';
        removeCell.appendChild(removeRowBtn);

        removeRowBtn.addEventListener('click', () => { removeRow(tableRow) });

        return removeCell;
    }
}