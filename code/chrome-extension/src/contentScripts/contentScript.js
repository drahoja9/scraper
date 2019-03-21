// Dynamic import to enable ES6 import/export feature and still be able to access the chrome.* APIs
(async () => {
    let shouldBeVisible = false;
    function beforeLoadListener(request, sender, sendResponse) {
        if (request.msg === 'TAB_UPDATED' && request.shouldBeVisible === true) {
            shouldBeVisible = true;
        }
    };
    // Adding a listener in case there is a message (notyfing that the control panel should be visible from 
    // the beginning) for our controller before it is even loaded (due to dynamic imports)
    chrome.runtime.onMessage.addListener(beforeLoadListener);

    const highlighterSrc = chrome.extension.getURL("src/contentScripts/highlighter.js");
    const textHighlighterSrc = chrome.extension.getURL("src/contentScripts/textHighlighter.js");
    const domNavigatorSrc = chrome.extension.getURL("src/contentScripts/domNavigator.js");
    const controllerSrc = chrome.extension.getURL("src/contentScripts/controller.js");

    const highlighterModule = await import(highlighterSrc);
    const textHighlighterMoudule = await import(textHighlighterSrc);
    const domNavigatorModule = await import(domNavigatorSrc);
    const controllerModule = await import(controllerSrc);

    const highlighter = new highlighterModule.Highlighter();
    const textHighlighter = new textHighlighterMoudule.TextHighlighter();
    const domNavigator = new domNavigatorModule.DOMNavigator();
    const controller = new controllerModule.Controller(shouldBeVisible, highlighter, textHighlighter, domNavigator);

    controller.listenToBackground();
    chrome.runtime.onMessage.removeListener(beforeLoadListener);
})();