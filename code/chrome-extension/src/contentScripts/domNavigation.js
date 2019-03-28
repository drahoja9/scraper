import { Messages } from '../constants.js';
import { isValid } from './utils.js';


export class DOMNavigaton {
    constructor() {
        this._current = undefined;

        this._attachControls = this._attachControls.bind(this);
        this._hideControls = this._hideControls.bind(this);
        this._firstChild = this._firstChild.bind(this);
        this._parent = this._parent.bind(this);
        this._previousSibling = this._previousSibling.bind(this);
        this._nextSibling = this._nextSibling.bind(this);

        // We need to bind all the methods first
        this._controls = this._createControls();
    }

    inject() {
        document.querySelector('body').appendChild(this._controls);
        this._controls.addEventListener('mouseenter', event => {
            this._controls.style.display = 'flex';
        });
        this._controls.addEventListener('mouseleave', this._hideControls);
    }

    notify({ msg, nodes }) {
        if (msg === Messages.SELECTED || msg === Messages.DECIDE_AUTO_SELECT) {
            nodes.forEach(node => {
                node.addEventListener('mouseenter', this._attachControls);
                node.addEventListener('mouseleave', this._hideControls);
            });
        } else if (msg === Messages.UNSELECTED || msg === Messages.UNSELECTED_CURRENT) {
            nodes.forEach(node => {
                node.removeEventListener('mouseenter', this._attachControls);
                node.removeEventListener('mouseleave', this._hideControls);
                this._hideControls();
            });
        }
    }

    _attachControls({ target }) {
        // Make the controls visible first in order to get it's width and height
        this._controls.style.display = 'flex';
        const elementRect = target.getBoundingClientRect();
        const bodyRect = document.body.getBoundingClientRect();
        let top;

        // Placing the controls either above or under the element 
        // depending on the remaining space
        if (elementRect.top - this._controls.offsetHeight > 0) {
            top = elementRect.top - this._controls.offsetHeight;
        } else {
            top = elementRect.top + elementRect.height;
        }

        const left = elementRect.left - this._controls.offsetWidth / 2 + elementRect.width / 2;
        this._controls.style.top = `${top - bodyRect.top}px`;
        this._controls.style.left = `${left - bodyRect.left}px`;
        this._current = target;
    }

    _hideControls(event) {
        this._controls.style.display = `none`;
    }

    _createControls() {
        const controls = document.createElement('div');
        controls.className = 'scraping-dom-navigation';
        const template = document.createElement('template');
        let html = '\
        <div style="display: flex;">\
            <div id="zoom-out" class="scraping-dom-navigaton-button">\
                <span>&minus;</span>\
            </div>\
            <div id="zoom-in" class="scraping-dom-navigaton-button">\
                <span>&plus;</span>\
            </div>\
            <div id="zoom-prev" class="scraping-dom-navigaton-button">\
                <span>&#129052;</span>\
            </div>\
            <div id="zoom-next" class="scraping-dom-navigaton-button">\
                <span>&#129054;</span>\
            </div>\
        </div>'.trim();
        template.innerHTML = html;
        const buttons = template.content.firstChild.children;
        buttons[0].addEventListener('click', this._parent);
        buttons[1].addEventListener('click', this._firstChild);
        buttons[2].addEventListener('click', this._previousSibling);
        buttons[3].addEventListener('click', this._nextSibling);
        controls.appendChild(template.content.firstChild);
        return controls;
    }

    _changeCurrent(key, callback) {
        let newCurrent = this._current[key];

        if (!newCurrent) return;
        while (!isValid(newCurrent)) {
            // If we want first child of an element, but that happens to be 
            // an invalid node, we have to try next sibling of this invalid node
            if (key === 'firstElementChild') {
                key = 'nextElementSibling';
            }
            newCurrent = newCurrent[key];
            if (!newCurrent) return;
        }

        if (this._current.classList.contains('scraping-selected-current')) {
            newCurrent.classList.add('scraping-selected-current');
        }
        newCurrent.classList.add('scraping-selected');
        this._current.classList.remove('scraping-selected', 'scraping-selected-current');

        this.notify({ msg: Messages.UNSELECTED, nodes: [this._current] });
        this.notify({ msg: Messages.SELECTED, nodes: [newCurrent] });
        this._current = newCurrent;

        callback({ target: this._current });
    }

    _firstChild() {
        this._changeCurrent('firstElementChild', this._hideControls);
    }

    _parent() {
        this._changeCurrent('parentElement', this._attachControls);
    }

    _previousSibling() {
        this._changeCurrent('previousElementSibling', this._hideControls);
    }

    _nextSibling() {
        this._changeCurrent('nextElementSibling', this._hideControls);
    }
}
