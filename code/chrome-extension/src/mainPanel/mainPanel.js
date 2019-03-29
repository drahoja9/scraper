import { Messages } from '../constants.js';

const ENTER_KEY = 13;



function sendMessageToContentScript(message, payload = null) {
    window.parent.postMessage({ type: Messages.FROM_MAIN_PANEL, msg: message, payload: payload }, '*');
}

function registerClickHandler(element, message, callback = () => { }) {
    element.addEventListener('click', function (event) {
        sendMessageToContentScript(message);
        callback();
    });
}

function registerInputHandler(textInput, message, exactCheck = null) {
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

function toggleAutoselectConfirmation(shouldEnable = null) {
    const alert = document.querySelector('#auto-select-alert');
    const acceptAutoSelectBtn = document.querySelector('#accept-auto-select');
    const rejectAutoSelectBtn = document.querySelector('#reject-auto-select');

    if (shouldEnable !== null) {
        acceptAutoSelectBtn.disabled = !shouldEnable;
        rejectAutoSelectBtn.disabled = !shouldEnable;
        if (shouldEnable) {
            alert.classList.add('show');
        } else {
            alert.classList.remove('show');
        }
    } else if (acceptAutoSelectBtn.disabled) {
        acceptAutoSelectBtn.disabled = false;
        rejectAutoSelectBtn.disabled = false;
        alert.classList.add('show');
    } else {
        acceptAutoSelectBtn.disabled = true;
        rejectAutoSelectBtn.disabled = true;
        alert.classList.remove('show');
    }
}

function addColumn() {
    const colsPool = document.querySelector('.cols-pool');
    const addBtn = colsPool.lastElementChild;
    const template = document.createElement('template');
    const html = `\
        <button class="col-btn">\
            <p class="col-name">Column #${colsPool.childElementCount}</p>\
            <span class="remove-col-btn">&times;</span>\
        </button>\
        `.trim();

    template.innerHTML = html;
    colsPool.replaceChild(template.content.firstChild, addBtn);
    colsPool.appendChild(addBtn);
}


// ========================================================================================================


$(function () {
    const rowsBtn = document.querySelector('#rows-btn');
    const colsBtn = document.querySelector('#cols-btn');

    const addColBtn = document.querySelector('#add-col-btn');

    const selectElementsBtn = document.querySelector('#select-elements-btn');

    const acceptAutoSelectBtn = document.querySelector('#accept-auto-select');
    const rejectAutoSelectBtn = document.querySelector('#reject-auto-select');

    const textSearchContainsInput = document.querySelector('#text-search-contains');
    const containsExactCheck = document.querySelector('#contains-exact');
    const textSearchStartsInput = document.querySelector('#text-search-starts');
    const textSearchEndsInput = document.querySelector('#text-search-ends');

    toggleAutoselectConfirmation();

    registerClickHandler(addColBtn, '', addColumn);
    registerClickHandler(selectElementsBtn, Messages.SELECT_ELEMENTS, () => { selectElementsBtn.classList.toggle('toggled-btn'); })
    registerClickHandler(acceptAutoSelectBtn, Messages.ACCEPT_AUTO_SELECT, toggleAutoselectConfirmation)
    registerClickHandler(rejectAutoSelectBtn, Messages.REJECT_AUTO_SELECT, toggleAutoselectConfirmation)
    registerInputHandler(
        textSearchContainsInput,
        Messages.TEXT_SEARCH_CONTAINS,
        containsExactCheck
    );
    registerInputHandler(
        textSearchStartsInput,
        Messages.TEXT_SEARCH_STARTS
    );
    registerInputHandler(
        textSearchEndsInput,
        Messages.TEXT_SEARCH_ENDS
    );

    window.addEventListener('message', (event) => {
        if (event.data.type !== Messages.FROM_CONTROLLER) {
            return;
        }
        switch (event.data.msg) {
            case Messages.DECIDE_AUTO_SELECT:
                toggleAutoselectConfirmation(true);
                break;
        }
    });
});