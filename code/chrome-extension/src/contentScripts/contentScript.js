// Dynamic import to enable ES6 import/export feature and still be able to access the chrome.* APIs
(async () => {
    let shouldBeVisible = false;
    let minimized = false;
    let onLeft = false;
    function beforeLoadListener(request, sender, sendResponse) {
        if (request.msg === 'TAB_UPDATED') {
            shouldBeVisible = request.shouldBeVisible;
            minimized = request.minimized;
            onLeft = request.onLeft;
        }
    }

    // Adding a listener in case there is a message (notifying that the control panel should be visible from
    // the beginning) for our controller before it is even loaded (due to dynamic imports)
    chrome.runtime.onMessage.addListener(beforeLoadListener);

    const controllerSrc = chrome.extension.getURL('src/contentScripts/controller.js');
    const controllerModule = await import(controllerSrc);
    const controller = new controllerModule.Controller();
    controller.init(shouldBeVisible, minimized, onLeft);

    chrome.runtime.onMessage.removeListener(beforeLoadListener);
})();