export class TextHighlighter {
    startsWith({ value }) {
        this._highlight(value, [
            (innerText, value) => innerText.startsWith(value)
        ]);
    }

    endsWith({ value }) {
        this._highlight(value, [
            (innerText, value) => innerText.endsWith(value)
        ]);
    }

    contains({ value, exactCheck }) {
        const exact = (innerText, value) => exactCheck && innerText === value;
        const nonExact = (innerText, value) => !exactCheck && innerText.includes(value);

        this._highlight(value, [(a, b) => exact(a, b), (a, b) => nonExact(a, b)]);
    }

    _searchDOM(selectTextNode, selectElementNode) {
        let nodes = [document.body];

        // Conditions
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

    _isValid(node) {
        const isNotScript = node => node.tagName.toLowerCase() !== 'script';
        const isNotHidden = node => (
            !node.hidden &&
            getComputedStyle(node).display !== 'none' &&
            node.style.display !== 'none' &&
            node.offsetWidth > 0 && node.offsetHeight > 0
        );

        return isNotScript(node) && isNotHidden(node);
    }

    _highlight(value, conditions) {
        const getText = node => node.innerText || node.wholeText;
        const getClassList = node => node.classList || node.parentElement.classList;
        const selectNode = node => {
            for (const condition of conditions) {
                const nodeText = getText(node).toLowerCase();
                const serchedValue = value.toLowerCase();
                if (condition(nodeText, serchedValue)) {
                    getClassList(node).add('scraping-selected');
                }
            }
        };
        const selectElementNode = node => {
            if (this._isValid(node)) {
                selectNode(node);
            }
        };

        this._searchDOM(selectNode, selectElementNode);
    }
}
