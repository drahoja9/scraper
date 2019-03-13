$(function () {
    const highlighter = new Highlighter();
    const controller = new Controller(highlighter);

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
