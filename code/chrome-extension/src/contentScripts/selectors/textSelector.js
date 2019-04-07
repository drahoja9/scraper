import { isValid } from '../utils.js';


export class TextSelector {
    constructor(selectEngine) {
        this._selectEngine = selectEngine;
    }

    startsWith({ value }) {
        this._highlight(value, (innerText, value) => innerText.startsWith(value));
    }

    endsWith({ value }) {
        this._highlight(value, (innerText, value) => innerText.endsWith(value));
    }

    contains({ value, exactCheck }) {
        if (exactCheck) {
            this._highlight(value, (innerText, value) => innerText === value);
        } else {
            this._highlight(value, (innerText, value) => innerText.includes(value));
        }
    }

    _searchDOM(selectTextNode, selectElementNode) {
        let nodes = [document.body];

        const hasChildren = node => node.children.length > 0;
        const hasText = node => node.innerText ? true : false;
        const isTextNode = node => node.nodeType === 3;

        while (nodes.length !== 0) {
            let current = nodes.pop();
            for (const child of current.childNodes) {
                if (isTextNode(child)) {
                    selectTextNode(child);
                } else if (hasText(child) && !hasChildren(child)) {
                    selectElementNode(child);
                } else if (hasText(child) && hasChildren(child)) {
                    nodes.push(child);
                }
            }
        }
    }

    _highlight(value, condition) {
        // Whitespace characters on their own are not valid values
        if (!value || value.match(/^\s*$/)) return;

        const getText = node => node.innerText || node.wholeText;
        const getNode = node => node.classList ? node : node.parentElement;

        const selectNode = node => {
            const nodeText = getText(node).toLowerCase();
            const serchedValue = value.toLowerCase();
            if (condition(nodeText, serchedValue)) {
                this._selectEngine.select(getNode(node));
            }
        };
        const selectElementNode = node => {
            if (isValid(node)) {
                selectNode(node);
            }
        };

        this._searchDOM(selectNode, selectElementNode);
    }
}
