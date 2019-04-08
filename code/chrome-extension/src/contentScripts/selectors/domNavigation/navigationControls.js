import { NavigationButton } from './navigationButton.js';


export class NavigationControls {
    constructor(domNavigation) {
        const zoomOut = new NavigationButton('zoom-out', '&minus;', () => {
            domNavigation.changeCurrent('parentElement', domNavigation.attachControls);
        });
        const zoomIn = new NavigationButton('zoom-in', '&plus;', () => {
            domNavigation.changeCurrent('firstElementChild', domNavigation.hideControls);
        });
        const zoomPrev = new NavigationButton('zoom-prev', '&#129052;', () => {
            domNavigation.changeCurrent('previousElementSibling', domNavigation.hideControls);
        });
        const zoomNext = new NavigationButton('zoom-next', '&#129054;', () => {
            domNavigation.changeCurrent('nextElementSibling', domNavigation.hideControls);
        });

        const buttons = document.createElement('div');
        buttons.style.display = 'flex';
        buttons.appendChild(zoomOut);
        buttons.appendChild(zoomIn);
        buttons.appendChild(zoomPrev);
        buttons.appendChild(zoomNext);
        this._buttons = buttons.children;

        this._controls = document.createElement('div');
        this._controls.className = 'scraping-dom-navigation';
        this._controls.appendChild(buttons);

        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.placeAt = this.placeAt.bind(this);
    }

    get node() {
        return this._controls;
    }

    show() {
        this._controls.style.display = 'flex';
    }

    hide() {
        this._controls.style.display = `none`;
    }

    placeAt({ top, left }, isSelectingRows) {
        this._controls.style.top = `${top}px`;
        this._controls.style.left = `${left}px`;

        if (isSelectingRows) {
            this._changeButtonColor('row');
        } else {
            this._changeButtonColor('col');
        }
    }

    _changeButtonColor(btnType) {
        for (const btn of this._buttons) {
            btn.className = `scraping-dom-navigation-button scraping-dom-navigation-${btnType}-button`;
        }
    }
}