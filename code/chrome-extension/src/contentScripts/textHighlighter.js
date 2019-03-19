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

    _searchDOM(callback) {
        let nodes = [document.body];

        // Conditions
        const hasNoChildren = node => node.children.length === 0;
        const hasNoText = node => node.innerText ? false : true;

        while (nodes.length !== 0) {
            let current = nodes.pop();
            for (let child of current.children) {
                // No reason to search in nodes with no innerText (including all of it's descedants)
                if (hasNoText(child)) {
                    continue;
                }

                if (hasNoChildren(child)) {
                    callback(child);
                } else {
                    nodes.push(child);
                }
            }
        }
    }

    _isValid(node) {
        // TODO: Somehow filter out the hidden elements (usually for accessibility)
        const isNotScript = node => node.tagName.toLowerCase() !== 'script';
        const isLink = node => node.tagName.toLowerCase() === 'a';
        const isSpan = node => node.tagName.toLowerCase() === 'span';
        const hasNonZeroDimensions = node => node.clientWidth !== 0 && node.clientHeight !== 0;

        return (
            isNotScript(node) &&
            (
                hasNonZeroDimensions(node) ||
                isLink(node) ||
                isSpan(node)
            )
        );
    }

    _highlight(value, conditions) {
        this._searchDOM(node => {
            if (this._isValid(node)) {
                for (const condition of conditions) {
                    if (condition(node.innerText.toLowerCase(), value.toLowerCase())) {
                        node.classList.add('scraping-selected');
                    }
                }
            }
        });
    }
}
