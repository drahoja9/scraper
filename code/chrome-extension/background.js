
chrome.runtime.onInstalled.addListener(function () {
    console.log('Successfully installed.');
});

chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.sendMessage(tab.id, { msg: 'injectControlPanel' });
});