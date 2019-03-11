class Highlighter {
    constructor() {
        this._isTurnedOn = false;
    }

    toggle() {
        this._toggleOnHoverHighlighting();
        this._toggleOnClickChoosing();
        this._isTurnedOn = !this._isTurnedOn;
    }

    _toggleEventListener(eventType, toggleFunc) {
        if (!this._isTurnedOn) {
            document.addEventListener(eventType, toggleFunc);
        } else {
            document.removeEventListener(eventType, toggleFunc);
        }
    }

    _highlightingFunc(event) {
        event.target.classList.toggle('scraping-highlighting');
    }

    _choosingFunc(event) {
        event.stopImmediatePropagation();
        event.preventDefault();
        event.target.classList.toggle('scraping-chosen');
    }

    _toggleOnHoverHighlighting() {
        this._toggleEventListener('mouseover', this._highlightingFunc);
        this._toggleEventListener('mouseout', this._highlightingFunc);
    }

    _toggleOnClickChoosing() {
        this._toggleEventListener('click', this._choosingFunc);
        this._toggleEventListener('mouseup', (event) => { event.preventDefault(); event.stopImmediatePropagation(); });
        this._toggleEventListener('mousedown', (event) => { event.preventDefault(); event.stopImmediatePropagation(); });
    }
}


class ControlPanel {
    constructor() {
        this._isInjected = false;
        this._isVisible = false;
        this._iframe = undefined;
        this._highlighter = new Highlighter();

        this._communicationWithIframe = this._communicationWithIframe.bind(this);
    }

    inject() {
        if (!this._isInjected) {
            this._injectIframe();
            this._toggleCommunication();
        }
    }

    toggle() {
        if (this._isVisible) {
            this._hide();
        } else {
            if (this._isInjected) {
                this._show();
            } else {
                this._injectIframe();
            }
        }
        this._toggleCommunication();
    }

    _show() {
        if (this._iframe !== undefined) {
            this._iframe.style = 'display: block;';
            this._isVisible = true;
        }
    }

    _hide() {
        if (this._iframe !== undefined) {
            this._iframe.style = 'display: none;';
            this._isVisible = false;
        }
    }

    _injectIframe() {
        const iframe = document.createElement('iframe');
        iframe.src = chrome.runtime.getURL(IFRAME_PAGE);
        iframe.className = 'scraping-iframe-panel';
        iframe.frameBorder = 0;
        document.querySelector('body').appendChild(iframe);

        this._isInjected = true;
        this._isVisible = true;
        this._iframe = iframe;
    }

    _communicationWithIframe() {
        if (event.data.type !== FROM_IFRAME) {
            return;
        }
        if (event.data.msg === SELECT_ELEMENTS) {
            this._highlighter.toggle();
        }
    }

    _toggleCommunication() {
        if (this._isVisible) {
            window.addEventListener('message', this._communicationWithIframe);
        } else {
            window.removeEventListener('message', this._communicationWithIframe);
        }
    }
}


// ========================================================================================================


$(function () {
    const controlPanel = new ControlPanel();

    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.msg === BROWSER_ACTION_CLICKED) {
                controlPanel.toggle();
            }

            if (request.msg === TAB_UPDATED && request.isVisible === true) {
                controlPanel.inject();
            }
        }
    );
});
