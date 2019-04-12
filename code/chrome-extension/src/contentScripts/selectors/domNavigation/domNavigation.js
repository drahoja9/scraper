import { Messages } from '/src/constants.js';
import { isValid } from '/src/contentScripts/utils.js';
import { NavigationControls } from './navigationControls.js';


export class DOMNavigaton {
    constructor(selectEngine) {
        this._current = undefined;
        this._shouldUnselect = true;
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
        if (msg === Messages.SELECTED) {
            nodes.forEach(node => {
                node.addEventListener('mouseenter', this.attachControls);
                node.addEventListener('mouseleave', this.hideControls);
            });
        } else if (msg === Messages.UNSELECTED) {
            nodes.forEach(node => {
                node.removeEventListener('mouseenter', this.attachControls);
                node.removeEventListener('mouseleave', this.hideControls);
                this.hideControls({ target: node }, true);
            });
        }
    }

    _computeCoordinates(target) {
        const elementRect = target.getBoundingClientRect();
        const htmlRect = document.body.parentElement.getBoundingClientRect();

        let top;
        // Placing the controls either above or under the element 
        // depending on the remaining space
        if (elementRect.top - this._controls.node.offsetHeight > 0) {
            top = elementRect.top - this._controls.node.offsetHeight;
        } else {
            top = elementRect.top + elementRect.height;
        }
        top -= htmlRect.top;

        const elementHorizontalHalf = elementRect.width / 2
        const controlsHorizontalHalf = this._controls.node.offsetWidth / 2
        let left = elementRect.left + elementHorizontalHalf - controlsHorizontalHalf;
        left -= htmlRect.left;

        return { top, left };
    }

    attachControls({ target }) {
        if (!this._selectEngine.areSelected([target])) return;
        // Make the controls visible first in order to get it's width and height
        this._controls.show();
        const coords = this._computeCoordinates(target);
        this._controls.placeAt(coords, this._selectEngine.isSelectingRows);
        this._current = target;
    }

    hideControls({ target }, force = false) {
        if (!force) {
            if (!this._selectEngine.areSelected([target])) return;
        }
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

        if (this._shouldUnselect) {
            this._selectEngine.unselect([this._current]);
            this.notify({ msg: Messages.UNSELECTED, nodes: [this._current] });
        }

        this._current = newCurrent;
        this._shouldUnselect = !this._selectEngine.areSelected([newCurrent]);

        this._selectEngine.select([newCurrent]);
        this.notify({ msg: Messages.SELECTED, nodes: [newCurrent] });

        callback({ target: this._current });
    }
}
