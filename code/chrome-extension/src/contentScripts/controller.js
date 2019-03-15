class Controller {
    constructor(highlighter, textHighlighter, domNavigator) {
        this._isInjected = false;
        this._isVisible = false;
        this._mainPanel = undefined;
        this._highlighter = highlighter;
        this._textHighlighter = textHighlighter;
        this._domNavigator = domNavigator;

        this._communicationWithMainPanel = this._communicationWithMainPanel.bind(this);
        this._highlighter.addListener(this._handleAutoselect.bind(this));
    }

    injectMainPanel() {
        if (!this._isInjected) {
            this._injectMainPanel();
            this._toggleCommunication();
        }
    }

    toggleMainPanel() {
        if (this._isVisible) {
            this._hideMainPanel();
        } else {
            if (this._isInjected) {
                this._showMainPanel();
            } else {
                this._injectMainPanel();
            }
        }
        this._toggleCommunication();
    }

    _showMainPanel() {
        if (this._mainPanel !== undefined) {
            this._mainPanel.style = 'display: block;';
            this._isVisible = true;
        }
    }

    _hideMainPanel() {
        if (this._mainPanel !== undefined) {
            this._mainPanel.style = 'display: none;';
            this._isVisible = false;
        }
    }

    _injectMainPanel() {
        const iframe = document.createElement('iframe');
        iframe.src = chrome.runtime.getURL(MAIN_PANEL_PAGE);
        iframe.className = 'scraping-iframe-panel';
        iframe.frameBorder = 0;
        document.querySelector('body').appendChild(iframe);

        this._isInjected = true;
        this._isVisible = true;
        this._mainPanel = iframe;
    }

    _communicationWithMainPanel() {
        if (event.data.type !== FROM_MAIN_PANEL) {
            return;
        }
        switch (event.data.msg) {
            case SELECT_ELEMENTS:
                this._highlighter.toggle();
                break;
            case ACCEPT_AUTO_SELECT:
                this._highlighter.acceptAutoSelect();
                break;
            case REJECT_AUTO_SELECT:
                this._highlighter.rejectAutoSelect();
                break;
            case ZOOM_IN:
                this._highlighter.current = this._domNavigator.firstChild(this._highlighter.current);
                break;
            case ZOOM_OUT:
                this._highlighter.current = this._domNavigator.parent(this._highlighter.current);
                break;
            case ZOOM_PREV:
                this._highlighter.current = this._domNavigator.previousSibling(this._highlighter.current);
                break;
            case ZOOM_NEXT:
                this._highlighter.current = this._domNavigator.nextSibling(this._highlighter.current);
                break;
            case TEXT_SEARCH_CONTAINS:
                this._textHighlighter.contains(event.data.payload);
                break;
            case TEXT_SEARCH_STARTS:
                this._textHighlighter.startsWith(event.data.payload);
                break;
            case TEXT_SEARCH_ENDS:
                this._textHighlighter.endsWith(event.data.payload);
                break;
            default:
                console.error('Unknown message from main panel!');
        }
    }

    _toggleCommunication() {
        if (this._isVisible) {
            window.addEventListener('message', this._communicationWithMainPanel);
        } else {
            window.removeEventListener('message', this._communicationWithMainPanel);
        }
    }

    _handleAutoselect() {
        this._mainPanel.contentWindow.postMessage(
            { type: FROM_CONTROLLER, msg: DECIDE_AUTO_SELECT },
            chrome.runtime.getURL(MAIN_PANEL_PAGE)
        );
    }
}
