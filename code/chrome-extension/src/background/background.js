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

async function getTabInfo(tabId) {
    const tabIdStr = String(tabId);
    let result = undefined;
    try {
        result = await getFromStorage(tabIdStr);
    } catch (err) {
        console.error(err);
    }
    if (result) {
        return {
            shouldBeVisible: result.shouldBeVisible || false,
            minimized: result.minimized || false,
            onLeft: result.onLeft || false
        };
    } else {
        return {
            shouldBeVisible: false,
            minimized: false,
            onLeft: false
        };
    }
}


// ========================================================================================================


chrome.runtime.onInstalled.addListener(function () {
    console.log('Successfully installed.');
    chrome.storage.local.clear();
});

chrome.browserAction.onClicked.addListener(async function (tab) {
    chrome.tabs.sendMessage(tab.id, { msg: Messages.BROWSER_ACTION_CLICKED });
    const tabInfo = await getTabInfo(tab.id);
    chrome.storage.local.set({
        [String(tab.id)]: { ...tabInfo, shouldBeVisible: !tabInfo.shouldBeVisible }
    });
});

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    const tabInfo = await getTabInfo(tab.id);
    chrome.tabs.sendMessage(tab.id, {
        msg: Messages.TAB_UPDATED,
        ...tabInfo
    });
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    chrome.storage.local.remove(String(tabId));
});

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    if (request.msg === Messages.DOWNLOAD) {
        chrome.downloads.download({
            url: request.url,
            filename: request.filename,
            saveAs: true
        });
    } else if (request.msg === Messages.SWITCH_SIDES) {
        const tabInfo = await getTabInfo(sender.tab.id);
        chrome.storage.local.set({
            [String(sender.tab.id)]: {
                ...tabInfo,
                onLeft: !tabInfo.onLeft
            }
        });
    } else if (request.msg === Messages.MINIMIZE_MAXIMIZE) {
        const tabInfo = await getTabInfo(sender.tab.id);
        chrome.storage.local.set({
            [String(sender.tab.id)]: {
                ...tabInfo,
                minimized: !tabInfo.minimized
            }
        });
    }
});
