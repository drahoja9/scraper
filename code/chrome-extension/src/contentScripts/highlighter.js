export class Highlighter {
    constructor() {
        this._isTurnedOn = false;
        this._previous = undefined;
        this._autoSelected = undefined;
        this._listeners = [];

        this._selectingFunc = this._selectingFunc.bind(this);
    }

    get current() {
        return this._previous;
    }

    set current(target) {
        if (this._previous === target) return;

        if (target.classList.contains('scraping-selected')) {
            target.classList.add('scraping-selected-already');
        }
        if (!this._previous.classList.contains('scraping-selected-already')) {
            this._previous.classList.remove('scraping-selected');
        }
        this._previous = target;
        this._previous.classList.add('scraping-selected');
    }

    toggle(shouldTurnOn = undefined) {
        if (shouldTurnOn !== undefined) {
            this._isTurnedOn = !shouldTurnOn;
        }
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

    addListener(handler) {
        this._listeners.push(handler);
    }

    _notifyListeners() {
        for (const handler of this._listeners) {
            handler();
        }
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
        const isNotSelected = className => className !== 'scraping-selected';

        let classString = ``;
        previousClasses.forEach((className) => {
            if (
                sameClasses(className) &&
                isNotHighlighted(className) &&
                isNotSelected(className)
            ) {
                classString += `.${className}`;
            }
        });

        return classString;
    }

    _createAttributesString(target) {
        const previousAttrs = this._previous.hasAttributes() ? this._previous.attributes : new NamedNodeMap();
        const currentAttrs = target.hasAttributes() ? target.attributes : new NamedNodeMap();
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

    _isValid(node) {
        const isNotScript = node => node.tagName.toLowerCase() !== 'script';
        const isLink = node => node.tagName.toLowerCase() === 'a';
        const isSpan = node => node.tagName.toLowerCase() === 'span';
        const hasNonZeroDimensions = node => node.clientWidth !== 0 && node.clientHeight !== 0;
        const isDisplayed = node => node.offsetWidth > 0 && node.offsetHeight > 0;
        const isNotHidden = node => !node.hidden;

        return (
            isNotScript(node) &&
            isDisplayed(node) &&
            isNotHidden(node) &&
            (
                isLink(node) ||
                isSpan(node) ||
                hasNonZeroDimensions(node)
            )
        );
    }

    _selectSimiliarElements(target) {
        // Conditions
        const isNotFirst = () => this._previous !== undefined;
        const isSelected = element => element.classList.contains('scraping-selected');

        if (isNotFirst() && isSelected(target)) {
            const tagString = this._createTagString(target);
            const classString = this._createClassString(target);
            const attributeString = this._createAttributesString(target);
            const selector = tagString + classString + attributeString;

            console.log(selector);
            if (selector) {
                const excludeSelected = ':not(.scraping-selected)';
                const similiarNodes = document.querySelectorAll(selector + excludeSelected);
                for (const node of similiarNodes) {
                    if (this._isValid(node)) {
                        node.classList.add('scraping-selected');
                    }
                }
                this._autoSelected = similiarNodes;
                this._notifyListeners();
            }
        }
    }

    _selectingFunc(event) {
        event.stopImmediatePropagation();
        event.preventDefault();

        const wasClassAdded = event.target.classList.toggle('scraping-selected');
        this._selectSimiliarElements(event.target);

        if (wasClassAdded) {
            this._previous = event.target;
        } else {
            this._previous = undefined;
        }
    }

    _highlightingFunc(event) {
        event.target.classList.toggle('scraping-highlighted');
    }

    _toggleEventListener(eventType, toggleFunc, capture = false) {
        if (!this._isTurnedOn) {
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
