import { Messages } from '../constants.js';
import { isValid } from './utils.js';


export class DOMNavigaton {
    constructor(selectEngine) {
        this._current = undefined;
        this._selectEngine = selectEngine;

        this.attachControls = this.attachControls.bind(this);
        this.hideControls = this.hideControls.bind(this);

        // We need to bind all the methods first
        this._controls = new NavigationControls(this);
    }

    inject() {
        document.querySelector('body').appendChild(this._controls.node);
        this._controls.node.addEventListener('mouseenter', this._controls.show);
        this._controls.node.addEventListener('mouseleave', this._controls.hide);
    }

    notify({ msg, nodes }) {
        if (msg === Messages.SELECTED || msg === Messages.DECIDING_AUTO_SELECT) {
            nodes.forEach(node => {
                node.addEventListener('mouseenter', this.attachControls);
                node.addEventListener('mouseleave', this.hideControls);
            });
        } else if (msg === Messages.UNSELECTED || msg === Messages.UNSELECTED_CURRENT) {
            nodes.forEach(node => {
                node.removeEventListener('mouseenter', this.attachControls);
                node.removeEventListener('mouseleave', this.hideControls);
                this.hideControls();
            });
        }
    }

    _computeCoordinates(target) {
        const elementRect = target.getBoundingClientRect();
        const bodyRect = document.body.getBoundingClientRect();

        let top;
        // Placing the controls either above or under the element 
        // depending on the remaining space
        if (elementRect.top - this._controls.node.offsetHeight > 0) {
            top = elementRect.top - this._controls.node.offsetHeight;
        } else {
            top = elementRect.top + elementRect.height;
        }
        top -= bodyRect.top;

        const elementHorizontalHalf = elementRect.width / 2
        const controlsHorizontalHalf = this._controls.node.offsetWidth / 2
        let left = elementRect.left + elementHorizontalHalf - controlsHorizontalHalf;
        left -= bodyRect.left;

        return { top, left };
    }

    attachControls({ target }) {
        if (!this._selectEngine.isSelected(target)) return;
        // Make the controls visible first in order to get it's width and height
        this._controls.show();
        const coords = this._computeCoordinates(target);
        this._controls.placeAt(coords, this._selectEngine.isSelectingRows);
        this._current = target;
    }

    hideControls() {
        this._controls.hide();
    }

    _getFirstValid(key) {
        let newCurrent = this._current[key];

        if (!newCurrent) return null;
        while (!isValid(newCurrent)) {
            // If we want first child of an element, but that happens to be 
            // an invalid node, we have to try next sibling of this invalid node
            if (key === 'firstElementChild') {
                key = 'nextElementSibling';
            }
            newCurrent = newCurrent[key];
            if (!newCurrent) return null;
        }

        return newCurrent;
    }

    changeCurrent(key, callback) {
        let newCurrent = this._getFirstValid(key);
        if (!newCurrent) return;

        this._selectEngine.select(newCurrent);
        this._selectEngine.unselect(this._current);

        this.notify({ msg: Messages.UNSELECTED, nodes: [this._current] });
        this.notify({ msg: Messages.SELECTED, nodes: [newCurrent] });
        this._current = newCurrent;

        callback({ target: this._current });
    }
}


class NavigationControls {
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


class NavigationButton {
    constructor(id, iconCode, clickHandler) {
        const icon = document.createElement('span');
        icon.innerHTML = iconCode;

        this._btn = document.createElement('div');
        this._btn.className = 'scraping-dom-navigation-button';
        this._btn.id = id;
        this._btn.appendChild(icon);
        this._btn.addEventListener('click', clickHandler);

        return this._btn;
    }
}
