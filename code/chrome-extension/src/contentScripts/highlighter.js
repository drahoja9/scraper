class Highlighter {
    constructor() {
        this._isTurnedOn = false;
        this._previous = undefined;
        this._autoSelected = undefined;

        this._selectingFunc = this._selectingFunc.bind(this);
    }

    get current() {
        return this._previous;
    }

    set current(target) {
        this._previous.classList.remove('scraping-selected');
        this._previous = target;
        this._previous.classList.add('scraping-selected');
    }

    toggle() {
        this._toggleOnHoverHighlighting();
        this._toggleOnClickSelecting();
        this._isTurnedOn = !this._isTurnedOn;
    }

    acceptAutoSelect() {
        this._autoSelected = undefined;
    }

    rejectAutoSelect() {
        this._autoSelected.forEach(node => {
            node.classList.remove('scraping-selected');
        });
        this._autoSelected = undefined;
        // User was unhappy with auto-select results, so now he starts from the
        // beginning -- 2 clicks to determine which elements should we select
        this._previous = undefined;
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
        const previousTag = this._previous.nodeName;
        const currentTag = target.nodeName;

        // Conditions
        const sameTags = (previous, current) => previous === current;
        const isNotDiv = tag => tag.toLowerCase() !== 'div';
        const isNotSpan = tag => tag.toLowerCase() !== 'span';

        return (
            sameTags(previousTag, currentTag) &&
            isNotDiv(currentTag) &&
            isNotSpan(currentTag)
        ) ? currentTag : '';
    }

    _createClassString(target) {
        const previousClasses = this._previous.classList;
        const currentClasses = target.classList;

        // Conditions
        const sameClasses = className => currentClasses.contains(className);
        const isNotHighlighted = className => className !== 'scraping-highlighted';

        let classString = ``;
        previousClasses.forEach((className) => {
            if (sameClasses(className) && isNotHighlighted(className)) {
                classString += `.${className}`;
            }
        });

        return classString;
    }

    _createAttributesString(target) {
        const previousAttrs = this._previous.hasAttributes() ? this._previous.attributes : new NamedNodeMap();
        const currentAttrs = target.hasAttributes() ? event.target.attributes : new NamedNodeMap();
        let attributeString = ``;

        // Conditions
        const isClass = attr => attr.name === 'class';
        const sameAttributeValue = (previous, current) => previous.value === current.value;

        for (let i = 0; i < previousAttrs.length; i++) {
            // Classes are handled separately
            if (isClass(previousAttrs[i])) {
                continue;
            }

            const attr = currentAttrs.getNamedItem(previousAttrs[i].name);
            if (attr && sameAttributeValue(previousAttrs[i], attr)) {
                const attrValue = attr.value ? ('="' + attr.value + '"') : '';
                attributeString += `[${attr.name}${attrValue}]`;
            }
        }

        return attributeString;
    }

    _selectSimiliarElements(target) {
        // Conditions
        const isNotFirst = () => this._previous !== undefined;
        const isNotSelected = element => !element.classList.contains('scraping-selected');

        if (isNotFirst() && isNotSelected(target)) {
            const tagString = this._createTagString(target);
            const classString = this._createClassString(target);
            const attributeString = this._createAttributesString(target);
            const selector = tagString + classString + attributeString;

            console.log(selector);
            if (selector) {
                const excludeSelected = ':not(.scraping-selected)';
                const excludeCurrent = ':not(.scraping-highlighted)';
                const similiarNodes = document.querySelectorAll(selector + excludeSelected + excludeCurrent);
                for (const node of similiarNodes) {
                    node.classList.add('scraping-selected');
                }
                this._autoSelected = similiarNodes;
            }
        }
    }

    _selectingFunc(event) {
        event.stopImmediatePropagation();
        event.preventDefault();

        this._selectSimiliarElements(event.target);

        const wasClassAdded = event.target.classList.toggle('scraping-selected');
        if (wasClassAdded) {
            this._previous = event.target;
        } else {
            this._previous = undefined;
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
