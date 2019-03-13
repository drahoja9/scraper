class Controller {
    constructor(highlighter) {
        this._isInjected = false;
        this._isVisible = false;
        this._mainPanel = undefined;
        this._highlighter = highlighter;

        this._communicationWithMainPanel = this._communicationWithMainPanel.bind(this);
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
        if (event.data.msg === SELECT_ELEMENTS) {
            this._highlighter.toggle();
        }
    }

    _toggleCommunication() {
        if (this._isVisible) {
            window.addEventListener('message', this._communicationWithMainPanel);
        } else {
            window.removeEventListener('message', this._communicationWithMainPanel);
        }
    }
}
