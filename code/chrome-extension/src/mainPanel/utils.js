import { Messages, ENTER_KEY } from '../constants.js';


function sendMessageToContentScript(message, payload = null) {
    window.parent.postMessage({ type: Messages.FROM_MAIN_PANEL, msg: message, payload: payload }, '*');
}

export function registerClickHandler(element, message, callback = () => { }) {
    registerHandler(element, 'click', message, callback);
}

export function registerHandler(element, eventType, message, callback = () => { }) {
    element.addEventListener(eventType, function (event) {
        sendMessageToContentScript(message);
        callback(event);
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