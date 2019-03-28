import { Messages } from '../constants.js';
import { isValid } from './utils.js';


export class MouseSelector {
    constructor() {
        this._isTurnedOn = false;
        this._current = undefined;
        this._autoSelected = undefined;
        // Every observer must implement `notify({msg, nodes})` method
        this._observers = [];

        this._selectingFunc = this._selectingFunc.bind(this);
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
        this._notifyObservers(Messages.UNSELECTED, this._autoSelected);
        this._autoSelected = undefined;
    }

    addObserver(observer) {
        this._observers.push(observer);
    }

    _notifyObservers(msg, nodes = []) {
        for (const observer of this._observers) {
            observer.notify({ msg, nodes });
        }
    }

    _setCurrent(newCurrent, current = this._current) {
        if (current) {
            current.classList.remove('scraping-selected-current');
        }
        this._current = newCurrent;
        if (newCurrent) {
            newCurrent.classList.add('scraping-selected-current');
        }
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
        const isNotSelected = className => className !== 'scraping-selected';

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

    _selectSimiliarElements(target) {
        const isNotFirst = () => this._current !== undefined;
        const isSelected = element => element.classList.contains('scraping-selected');

        if (isNotFirst() && isSelected(target)) {
            const tagString = this._createTagString(target);
            const classString = this._createClassString(target);
            const attributeString = this._createAttributesString(target);
            const selector = tagString + classString + attributeString;

            const isNotOnlyDiv = select => select !== 'div';
            const isNotOnlySpan = select => select !== 'span';

            if (selector && isNotOnlyDiv(selector) && isNotOnlySpan(selector)) {
                const excludeSelected = ':not(.scraping-selected)';
                const similiarNodes = document.querySelectorAll(selector + excludeSelected);
                for (const node of similiarNodes) {
                    if (isValid(node)) {
                        node.classList.add('scraping-selected');
                    }
                }
                this._autoSelected = similiarNodes;
                this._notifyObservers(Messages.DECIDE_AUTO_SELECT, this._autoSelected);
            }
        }
    }

    _selectingFunc(event) {
        event.stopImmediatePropagation();
        event.preventDefault();

        const wasClassAdded = event.target.classList.toggle('scraping-selected');
        this._selectSimiliarElements(event.target);

        if (wasClassAdded) {
            this._setCurrent(event.target);
            this._notifyObservers(Messages.SELECTED, [event.target]);
        } else if (event.target.classList.contains('scraping-selected-current')) {
            this._setCurrent(undefined, event.target);
            this._notifyObservers(Messages.UNSELECTED_CURRENT, [event.target]);
        } else {
            this._notifyObservers(Messages.UNSELECTED, [event.target]);
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
