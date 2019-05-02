export class ChromeAPI {
    static mock() {
        const path = require('path');
        return {
            runtime: {
                getURL: jest.fn(url => 'file://' + path.resolve(__dirname, '../..' + url)),
                sendMessage: jest.fn(msg => {
                }),
                onMessage: {
                    listener: undefined,
                    addListener: jest.fn(cb => {
                        chrome.runtime.onMessage.listener = cb;
                    })
                }
            }
        };
    }
}