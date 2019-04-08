import { RemoveRowBtn } from './removeRowBtn.js';
import { PreviewTableCell } from './previewTableCell.js';


export class PreviewTableRow {
    constructor(columnNames, rowData, removeRow) {
        const tableRow = document.createElement('tr');
        tableRow.className = 'scraping-protected';
        tableRow.appendChild(new RemoveRowBtn(tableRow, removeRow));
        for (const colName of columnNames) {
            tableRow.appendChild(new PreviewTableCell(rowData[colName]));
        }

        return tableRow;
    }
}
