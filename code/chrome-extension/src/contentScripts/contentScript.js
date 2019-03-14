$(function () {
    const highlighter = new Highlighter();
    const zooming = new Zooming();
    const controller = new Controller(highlighter, zooming);

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
