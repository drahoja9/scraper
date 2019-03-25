import { Messages } from '../constants.js';


export class DOMNavigator {
    constructor() {
        this._controls = this._createControls();
        this._currentElement = undefined;

        this._attachControls = this._attachControls.bind(this);
        this._hideControls = this._hideControls.bind(this);
        this._firstChild = this._firstChild.bind(this);
        this._parent = this._parent.bind(this);
        this._previousSibling = this._previousSibling.bind(this);
        this._nextSibling = this._nextSibling.bind(this);
    }

    inject() {
        document.querySelector('body').appendChild(this._controls);
        this._controls.addEventListener('mouseenter', event => {
            this._controls.style.display = 'block';
            this._currentElement = event.relatedTarget;
        });
        this._controls.addEventListener('mouseleave', this._hideControls);
        this._controls.querySelector('#zoom-in').addEventListener('click', this._firstChild);
        this._controls.querySelector('#zoom-out').addEventListener('click', this._parent);
        this._controls.querySelector('#zoom-prev').addEventListener('click', this._previousSibling);
        this._controls.querySelector('#zoom-next').addEventListener('click', this._nextSibling);
    }

    notify({ msg, node }) {
        if (msg === Messages.SELECTED) {
            node.addEventListener('mouseenter', this._attachControls);
            node.addEventListener('mouseleave', this._hideControls);
        } else if (msg === Messages.UNSELECTED || msg === Messages.UNSELECTED_CURRENT) {
            node.removeEventListener('mouseenter', this._attachControls);
            node.removeEventListener('mouseleave', this._hideControls);
        }
    }

    _attachControls({ target }) {
        // Make the controls visible first in order to get it's width and height
        this._controls.style.display = 'block';
        const elementRect = target.getBoundingClientRect();
        const bodyRect = document.body.getBoundingClientRect();
        const top = elementRect.top - this._controls.offsetHeight;
        const left = elementRect.left - this._controls.offsetWidth / 2 + elementRect.width / 2;
        this._controls.style.top = `${top - bodyRect.top}px`;
        this._controls.style.left = `${left - bodyRect.left}px`;
        this._currentElement = target;
    }

    _hideControls(event) {
        this._controls.style.display = `none`;
        this._currentElement = undefined;
    }

    _createControls() {
        const controls = document.createElement('div');
        controls.className = 'scraping-dom-navigation';
        const template = document.createElement('template');
        let html = '\
        <div class="row">\
            <button id="zoom-out" class="scraping-dom-navigator-button col">\
                <span>&minus;</span>\
            </button>\
            <button id="zoom-in" class="scraping-dom-navigator-button col">\
                <span>&plus;</span>\
            </button>\
            <button id="zoom-prev" class="scraping-dom-navigator-button col">\
                <span style="position: relative; left: -4px;">&#129052;</span>\
            </button>\
            <button id="zoom-next" class="scraping-dom-navigator-button col">\
                <span style="position: relative; left: -4px;">&#129054;</span>\
            </button>\
        </div>'.trim();
        template.innerHTML = html;
        controls.appendChild(template.content.firstChild);
        return controls;
    }

    _changeCurrent(key, callback) {
        const nextCurrent = this._currentElement[key];
        if (!nextCurrent) {
            return;
        }

        if (this._currentElement.classList.contains('scraping-selected')) {
            nextCurrent.classList.add('scraping-selected');
        }
        if (this._currentElement.classList.contains('scraping-selected-current')) {
            nextCurrent.classList.add('scraping-selected-current');
        }
        this._currentElement.classList.remove('scraping-selected', 'scraping-selected-current');

        this.notify({ msg: Messages.UNSELECTED, node: this._currentElement });
        this.notify({ msg: Messages.SELECTED, node: nextCurrent });
        this._currentElement = nextCurrent;

        callback({ target: this._currentElement });
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
