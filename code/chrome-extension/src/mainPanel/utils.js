import { Messages } from '../constants.js';


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
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessageToContentScript(message, {
                value: textInput.value,
                exact: exactCheck ? exactCheck.checked : null
            });
        }
    });
}