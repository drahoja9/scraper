export class RemoveRowBtn {
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
