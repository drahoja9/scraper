class TextSelectorInterface {
    startsWith({ value }) {
        throw Error('Not implemented!');
    }

    endsWith({ value }) {
        throw Error('Not implemented!');
    }

    contains({ value, exactCheck }) {
        throw Error('Not implemented!');
    }
}


export class TextSelector extends TextSelectorInterface {
    constructor(selectEngine) {
        super();
        this._selectEngine = selectEngine;
    }

    startsWith({ value }) {
        this._highlight(value, (innerText, value) => innerText.startsWith(value));
    }

    endsWith({ value }) {
        this._highlight(value, (innerText, value) => innerText.endsWith(value));
    }

    contains({ value, exact }) {
        if (exact) {
            this._highlight(value, (innerText, value) => innerText === value);
        } else {
            this._highlight(value, (innerText, value) => innerText.includes(value));
        }
    }

    _searchDOM(selectNode) {
        let nodes = [document.querySelector('body')];

        const hasChildren = node => node.children.length > 0;
        const hasText = node => !!node.innerText;
        const isTextNode = node => node.nodeType === 3;

        while (nodes.length !== 0) {
            let current = nodes.pop();
            for (const child of current.childNodes) {
                if (isTextNode(child) || (hasText(child) && !hasChildren(child))) {
                    selectNode(child);
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

        let toSelect = [];
        const selectNode = node => {
            const nodeText = getText(node).toLowerCase();
            const serchedValue = value.toLowerCase();
            if (condition(nodeText, serchedValue)) {
                toSelect.push(getNode(node));
            }
        };

        this._searchDOM(selectNode);
        this._selectEngine.select(toSelect);
    }
}
