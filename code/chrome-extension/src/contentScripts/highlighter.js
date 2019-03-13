class Highlighter {
    constructor() {
        this._isTurnedOn = false;
        this._selected = undefined;

        this._selectingFunc = this._selectingFunc.bind(this);
    }

    toggle() {
        this._toggleOnHoverHighlighting();
        this._toggleOnClickSelecting();
        this._isTurnedOn = !this._isTurnedOn;
    }

    _toggleEventListener(eventType, toggleFunc, capture = false) {
        if (!this._isTurnedOn) {
            document.addEventListener(eventType, toggleFunc, capture);
        } else {
            document.removeEventListener(eventType, toggleFunc, capture);
        }
    }

    _highlightingFunc(event) {
        event.target.classList.toggle('scraping-highlighted');
    }

    _createTagString(target) {
        const previousTag = this._selected.nodeName;
        const currentTag = target.nodeName;
        return previousTag === currentTag ? previousTag : '';
    }

    _createClassString(target) {
        const previousClasses = this._selected.classList;
        const currentClasses = target.classList;

        let classString = ``;
        previousClasses.forEach((className) => {
            if (currentClasses.contains(className) && className !== 'scraping-highlighted') {
                classString += `.${className}`;
            }
        });

        return classString;
    }

    _createAttributesString(target) {
        const previousAttrs = this._selected.hasAttributes() ? this._selected.attributes : new NamedNodeMap();
        const currentAttrs = target.hasAttributes() ? event.target.attributes : new NamedNodeMap();
        let attributeString = ``;

        for (let i = 0; i < previousAttrs.length; i++) {
            // Classes are handled separately
            if (previousAttrs[i].name === 'class') {
                continue;
            }

            const attr = currentAttrs.getNamedItem(previousAttrs[i].name);
            if (attr && attr.value === previousAttrs[i].value) {
                const attrValue = attr.value ? ('="' + attr.value + '"') : '';
                attributeString += `[${attr.name}${attrValue}]`;
            }
        }

        return attributeString;
    }

    _selectSimiliarElements(target) {
        if (this._selected !== undefined && !target.classList.contains('scraping-selected')) {
            const tagString = this._createTagString(target);
            const classString = this._createClassString(target);
            const attributeString = this._createAttributesString(target);
            const selector = tagString + classString + attributeString;

            console.log(selector);
            if (selector) {
                const similiarNodes = document.querySelectorAll(selector);
                similiarNodes.forEach((node) => {
                    if (node != target) {
                        node.classList.add('scraping-selected');
                    }
                });
            }
        }
    }

    _selectingFunc(event) {
        event.stopImmediatePropagation();
        event.preventDefault();

        this._selectSimiliarElements(event.target);

        const wasClassAdded = event.target.classList.toggle('scraping-selected');
        if (wasClassAdded) {
            this._selected = event.target;
        } else {
            this._selected = undefined;
        }
    }

    _toggleOnHoverHighlighting() {
        this._toggleEventListener('mouseover', this._highlightingFunc);
        this._toggleEventListener('mouseout', this._highlightingFunc);
    }

    _toggleOnClickSelecting() {
        this._toggleEventListener('click', this._selectingFunc, true);
    }
}
