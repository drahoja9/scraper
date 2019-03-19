// Dynamic import
(async () => {
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
    const controller = new controllerModule.Controller(highlighter, textHighlighter, domNavigator);

    controller.listenToBackground();
})();