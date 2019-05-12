export class ColumnName {
    constructor(number) {
        this._name = document.createElement('p');
        this._name.classList.add('col-name');
        this._name.innerText = `Column #${number}`;

        return this._name;
    }
}
