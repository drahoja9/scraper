export class RemoveRowBtn {
    constructor(tableRow, removeRow) {
        const removeRowBtn = document.createElement('span');
        removeRowBtn.innerHTML = '&times;';
        removeRowBtn.className = 'scraping-remove-row scraping-protected';

        const removeCell = document.createElement('td');
        removeCell.className = 'scraping-protected';
        removeCell.appendChild(removeRowBtn);

        removeRowBtn.addEventListener('click', () => { removeRow(tableRow) });

        return removeCell;
    }
}
