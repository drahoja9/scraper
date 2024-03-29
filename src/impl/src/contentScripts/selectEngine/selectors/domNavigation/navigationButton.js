export class NavigationButton {
    constructor(id, iconCode, clickHandler) {
        const icon = document.createElement('span');
        icon.innerHTML = iconCode;
        icon.className = 'scraping-protected';

        this._btn = document.createElement('div');
        this._btn.className = 'scraping-dom-navigation-button scraping-protected';
        this._btn.id = id;
        this._btn.appendChild(icon);
        this._btn.addEventListener('click', clickHandler);

        return this._btn;
    }
}
