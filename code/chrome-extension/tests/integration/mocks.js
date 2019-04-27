export class ChromeAPI {
    constructor() {
        this.messageHandler = undefined;
    }

    get() {
        return {
            runtime: {
                getURL: jest.fn(url => url),
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