export class SelectEngineMockup {
    constructor() {
        this._classes = ['scraping-class-1', 'scraping-class-2'];
    }

    get classes() {
        return this._classes;
    }

    areSelected(elements) {
        for (const element of elements) {
            for (const cls of this._classes) {
                if (!element.classList.contains(cls)) {
                    return false;
                }
            }
        }
        return true;
    }

    select(elements) {
        for (const element of elements) {
            element.classList.add(...this._classes);
        }
    }

    unselect(elements) {
        for (const element of elements) {
            element.classList.remove(...this._classes);
        }
    }

    toggle(elements) {
        if (this.areSelected(elements)) {
            this.unselect(elements);
            return false;
        } else {
            this.select(elements);
            return true;
        }
    }
}