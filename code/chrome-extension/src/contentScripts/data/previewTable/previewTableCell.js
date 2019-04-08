export class PreviewTableCell {
    constructor(cellText) {
        const tableCell = document.createElement('td');
        tableCell.innerText = cellText;

        return tableCell;
    }
}
