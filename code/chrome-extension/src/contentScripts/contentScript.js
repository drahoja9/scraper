$(function () {
    const highlighter = new Highlighter();
    const textHighlighter = new TextHighlighter();
    const domNavigator = new DOMNavigator();
    const controller = new Controller(highlighter, textHighlighter, domNavigator);

    // Communication with backrground.js (main page of the extension)
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.msg === BROWSER_ACTION_CLICKED) {
                controller.toggleMainPanel();
            }

            if (request.msg === TAB_UPDATED && request.isVisible === true) {
                controller.injectMainPanel();
            }
        }
    );
});
