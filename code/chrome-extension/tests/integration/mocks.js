export class ChromeAPI {
    constructor() {
        this.messageHandler = undefined;
    }

    get() {
        const path = require('path');
        return {
            runtime: {
                getURL: jest.fn(url => 'file://' + path.resolve(__dirname, '../..' + url)),
                sendMessage: jest.fn(msg => {
                }),
                onMessage: {
                    addListener: jest.fn(cb => {
                        this.messageHandler = cb;
                    })
                }
            }
        };
    }
}