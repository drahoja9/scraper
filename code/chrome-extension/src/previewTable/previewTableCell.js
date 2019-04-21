export class PreviewTableCell {
    constructor(cellText) {
        const tableCell = document.createElement('td');
        tableCell.className = 'scraping-protected';
        tableCell.innerText = cellText;

        return tableCell;
    }
}
