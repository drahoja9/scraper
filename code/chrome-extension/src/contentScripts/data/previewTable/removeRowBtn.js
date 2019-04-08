export class RemoveRowBtn {
    constructor(tableRow, removeRow) {
        const removeCell = document.createElement('td');
        removeCell.className = 'scraping-protected';
        const removeRowBtn = document.createElement('span');
        removeRowBtn.innerHTML = '&times;';
        removeRowBtn.className = 'scraping-remove-row scraping-protected';
        removeCell.appendChild(removeRowBtn);

        removeRowBtn.addEventListener('click', () => { removeRow(tableRow) });

        return removeCell;
    }
}
