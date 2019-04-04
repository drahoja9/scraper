import { Messages } from '../../constants.js';
import { isValid } from '../utils.js';


export class MouseSelector {
    constructor(selectEngine) {
        this._isTurnedOn = false;
        this._current = undefined;
        this._autoSelected = undefined;
        this._selectEngine = selectEngine;
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

    reset() {
        this._current = undefined;
        this._autoSelected = undefined;
    }

    acceptAutoSelect() {
        this._autoSelected = undefined;
    }

    rejectAutoSelect() {
        this._autoSelected.forEach(node => {
            this._selectEngine.unselect(node);
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

    _selectSimiliarElements(target) {
        const isNotFirst = () => this._current !== undefined;
        const isSelected = element => this._selectEngine.isSelected(element);

        if (isNotFirst() && isSelected(target)) {
            const tagString = this._createTagString(target);
            const classString = this._createClassString(target);
            const attributeString = this._createAttributesString(target);
            const selector = tagString + classString + attributeString;

            const isNotOnlyDiv = select => select !== 'div';
            const isNotOnlySpan = select => select !== 'span';

            if (selector && isNotOnlyDiv(selector) && isNotOnlySpan(selector)) {
                let excludeSelected = '';
                this._selectEngine.classes.map(cls => excludeSelected += `:not(.${cls})`);
                const similiarNodes = document.querySelectorAll(selector + excludeSelected);
                for (const node of similiarNodes) {
                    if (isValid(node)) {
                        this._selectEngine.select(node);
                    }
                }
                this._autoSelected = similiarNodes;
                this._notifyObservers(Messages.DECIDING_AUTO_SELECT, this._autoSelected);
            }
        }
    }

    _selectingFunc(event) {
        event.stopImmediatePropagation();
        event.preventDefault();

        const wasClassAdded = this._selectEngine.toggle(event.target);
        this._selectSimiliarElements(event.target);

        if (wasClassAdded) {
            this._current = event.target;
            this._notifyObservers(Messages.SELECTED, [event.target]);
        } else if (event.target === this._current) {
            this._current = undefined;
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
