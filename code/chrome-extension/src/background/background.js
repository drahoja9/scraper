import { Messages } from '../constants.js';


function getFromStorage(storageKey) {
    return new Promise(function (resolve, reject) {
        chrome.storage.local.get(storageKey, function (result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            } else {
                resolve(result[storageKey]);
            }
        });
    });
}

async function isVisibleInTab(tabId) {
    const tabIdStr = String(tabId);
    let result = undefined;
    try {
        result = await getFromStorage(tabIdStr);
    } catch (err) {
        console.error(err);
    }
    return result ? result.isVisible : false;
}


// ========================================================================================================


chrome.runtime.onInstalled.addListener(function () {
    console.log('Successfully installed.');
    chrome.storage.local.clear();
});

chrome.browserAction.onClicked.addListener(async function (tab) {
    chrome.tabs.sendMessage(tab.id, { msg: Messages.BROWSER_ACTION_CLICKED });
    const isVisible = await isVisibleInTab(tab.id);
    chrome.storage.local.set({ [String(tab.id)]: { isVisible: !isVisible } });
});

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    const isVisible = await isVisibleInTab(tab.id);
    chrome.tabs.sendMessage(tab.id, { msg: Messages.TAB_UPDATED, isVisible: isVisible });
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    chrome.storage.local.remove(String(tabId));
});
