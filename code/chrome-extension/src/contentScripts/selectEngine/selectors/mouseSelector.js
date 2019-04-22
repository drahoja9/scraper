export class MouseSelector {
    constructor(selectEngine) {
        this._isTurnedOn = false;
        this._current = undefined;
        this._highlightingClass = undefined;
        this._selectEngine = selectEngine;

        this._selectingFunc = this._selectingFunc.bind(this);
        this._highlightingFunc = this._highlightingFunc.bind(this);
    }

    toggle(highlightingClass = '') {
        this._highlightingClass = highlightingClass;
        this._isTurnedOn = !this._isTurnedOn;
        this._toggleOnHoverHighlighting();
        this._toggleOnClickSelecting();
    }

    reset() {
        this._current = undefined;
    }

    _createTagString(target) {
        const currentTag = this._current.nodeName;
        const newTag = target.nodeName;
        return currentTag === newTag ? newTag.toLowerCase() : '';
    }

    _createClassString(target) {
        const currentClasses = this._current.classList;
        const newClasses = target.classList;

        const sameClasses = className => newClasses.contains(className);
        const isNotSelected = className => !this._selectEngine.classes.includes(className);

        let classString = ``;
        currentClasses.forEach(className => {
            if (sameClasses(className) && isNotSelected(className)) {
                classString += `.${className}`;
            }
        });

        return classString;
    }

    _createAttributesString(target) {
        const currentAttrs = this._current.hasAttributes() ? this._current.attributes : new NamedNodeMap();
        const newAttrs = target.hasAttributes() ? target.attributes : new NamedNodeMap();
        let attributeString = ``;

        const isClass = attr => attr.name === 'class';
        const sameAttributeValue = (currentAttr, newAttr) => currentAttr.value === newAttr.value;

        for (let i = 0; i < currentAttrs.length; i++) {
            // Classes are handled separately
            if (isClass(currentAttrs[i])) {
                continue;
            }

            const attr = newAttrs.getNamedItem(currentAttrs[i].name);
            if (attr && sameAttributeValue(currentAttrs[i], attr)) {
                const attrValue = attr.value ? ('="' + attr.value + '"') : '';
                attributeString += `[${attr.name}${attrValue}]`;
            }
        }

        return attributeString;
    }

    _selectSimiliarElements({ target, ctrlKey }) {
        const isNotFirst = () => this._current !== undefined;
        const isSelected = element => this._selectEngine.areSelected([element]);

        if (isNotFirst() && isSelected(target) && ctrlKey) {
            const tagString = this._createTagString(target);
            const classString = this._createClassString(target);
            const attributeString = this._createAttributesString(target);
            const selector = tagString + classString + attributeString;

            const isNotOnlyDiv = select => select !== 'div';
            const isNotOnlySpan = select => select !== 'span';

            if (selector && isNotOnlyDiv(selector) && isNotOnlySpan(selector)) {
                let excludeSelected = '';
                this._selectEngine.classes.forEach(cls => excludeSelected += `:not(.${cls})`);
                const similiarNodes = document.querySelectorAll(selector + excludeSelected);
                this._selectEngine.select(similiarNodes);
            }
        }
    }

    _selectingFunc(event) {
        if (event.target.classList.contains('scraping-protected')) return;

        event.stopImmediatePropagation();
        event.preventDefault();

        const wasClassAdded = this._selectEngine.toggle([event.target]);
        this._selectSimiliarElements(event);

        if (wasClassAdded) {
            this._current = event.target;
        } else if (event.target === this._current) {
            this._current = undefined;
        }
    }

    _highlightingFunc(event) {
        if (event.target.classList.contains('scraping-protected')) return;
        event.target.classList.toggle(this._highlightingClass);
    }

    _toggleEventListener(eventType, toggleFunc, capture = false) {
        if (this._isTurnedOn) {
            document.addEventListener(eventType, toggleFunc, capture);
        } else {
            document.removeEventListener(eventType, toggleFunc, capture);
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
