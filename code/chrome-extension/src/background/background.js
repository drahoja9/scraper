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

async function shouldBeVisibleInTab(tabId) {
    const tabIdStr = String(tabId);
    let result = undefined;
    try {
        result = await getFromStorage(tabIdStr);
    } catch (err) {
        console.error(err);
    }
    return result ? result.shouldBeVisible : false;
}


// ========================================================================================================


chrome.runtime.onInstalled.addListener(function () {
    console.log('Successfully installed.');
    chrome.storage.local.clear();
});

chrome.browserAction.onClicked.addListener(async function (tab) {
    chrome.tabs.sendMessage(tab.id, { msg: Messages.BROWSER_ACTION_CLICKED });
    const shouldBeVisible = await shouldBeVisibleInTab(tab.id);
    chrome.storage.local.set({ [String(tab.id)]: { shouldBeVisible: !shouldBeVisible } });
});

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    const shouldBeVisible = await shouldBeVisibleInTab(tab.id);
    chrome.tabs.sendMessage(tab.id, { msg: Messages.TAB_UPDATED, shouldBeVisible: shouldBeVisible });
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    chrome.storage.local.remove(String(tabId));
});
