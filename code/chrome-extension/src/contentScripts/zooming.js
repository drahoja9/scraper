class Zooming {
    _nullCheck(target, result) {
        return result !== null ? result : target;
    }

    firstChild(target) {
        return this._nullCheck(target, target.firstElementChild);
    }

    parent(target) {
        return this._nullCheck(target, target.parentElement);
    }

    previousSibling(target) {
        return this._nullCheck(target, target.previousElementSibling);
    }

    nextSibling(target) {
        return this._nullCheck(target, target.nextElementSibling);
    }
}