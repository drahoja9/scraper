import { Messages, ENTER_KEY } from '../constants.js';


export function sendMessageToContentScript(message, payload = null) {
    window.parent.postMessage({ type: Messages.FROM_MAIN_PANEL, msg: message, payload: payload }, '*');
}

export function registerClickHandler(element, message, callback = () => { }, payloadGetter) {
    registerHandler(element, 'click', message, callback, payloadGetter);
}

export function registerHandler(element, eventType, message, callback = () => { }, payloadGetter = () => { }) {
    element.addEventListener(eventType, function (event) {
        callback(event);
        sendMessageToContentScript(message, payloadGetter());
    });
}

export function registerInputHandler(textInput, message, exactCheck = null) {
    textInput.addEventListener('keydown', function (event) {
        if (event.keyCode === ENTER_KEY) {
            event.preventDefault();
            sendMessageToContentScript(message, {
                value: textInput.value,
                exactCheck: exactCheck ? exactCheck.checked : null
            });
        }
    });
}