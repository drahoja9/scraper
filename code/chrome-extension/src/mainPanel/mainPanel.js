import { Messages } from '../constants.js';


function sendMessageToContentScript(message, payload = null) {
    window.parent.postMessage({ type: Messages.FROM_MAIN_PANEL, msg: message, payload: payload }, '*');
}

function registerClickHandler(element, message, callback = () => { }) {
    element.addEventListener('click', function (event) {
        sendMessageToContentScript(message);
        callback();
    });
}

function registerInputHandler(submitBtn, textInput, message, exactCheck = null) {
    submitBtn.addEventListener('click', function (event) {
        sendMessageToContentScript(message, {
            value: textInput.value,
            exactCheck: exactCheck ? exactCheck.checked : null
        });
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

function toggleDOMNavigation(shouldEnable = null) {
    const zoomInBtn = document.querySelector('#zoom-in');
    const zoomOutBtn = document.querySelector('#zoom-out');
    const zoomPrevBtn = document.querySelector('#zoom-prev');
    const zoomNextBtn = document.querySelector('#zoom-next');

    if (shouldEnable !== null) {
        zoomInBtn.disabled = !shouldEnable;
        zoomOutBtn.disabled = !shouldEnable;
        zoomPrevBtn.disabled = !shouldEnable;
        zoomNextBtn.disabled = !shouldEnable;
    } else if (zoomInBtn.disabled) {
        zoomInBtn.disabled = false;
        zoomOutBtn.disabled = false;
        zoomPrevBtn.disabled = false;
        zoomNextBtn.disabled = false;
    } else {
        zoomInBtn.disabled = true;
        zoomOutBtn.disabled = true;
        zoomPrevBtn.disabled = true;
        zoomNextBtn.disabled = true;
    }
}


// ========================================================================================================


$(function () {
    const selectElementsBtn = document.querySelector('#select-elements-btn');

    const acceptAutoSelectBtn = document.querySelector('#accept-auto-select');
    const rejectAutoSelectBtn = document.querySelector('#reject-auto-select');

    const zoomInBtn = document.querySelector('#zoom-in');
    const zoomOutBtn = document.querySelector('#zoom-out');
    const zoomPrevBtn = document.querySelector('#zoom-prev');
    const zoomNextBtn = document.querySelector('#zoom-next');

    const textSearchContainsInput = document.querySelector('#text-search-contains');
    const submitTextSearchContainsBtn = document.querySelector('#submit-text-search-contains');
    const containsExactCheck = document.querySelector('#contains-exact');
    const textSearchStartsInput = document.querySelector('#text-search-starts');
    const submitTextSearchStartsBtn = document.querySelector('#submit-text-search-starts');
    const textSearchEndsInput = document.querySelector('#text-search-ends');
    const submitTextSearchEndsBtn = document.querySelector('#submit-text-search-ends');

    $('.toast').toast({ autohide: false });
    $('.toast').toast('show')
    toggleAutoselectConfirmation();
    // toggleDOMNavigation();

    registerClickHandler(selectElementsBtn, Messages.SELECT_ELEMENTS)
    registerClickHandler(acceptAutoSelectBtn, Messages.ACCEPT_AUTO_SELECT, toggleAutoselectConfirmation)
    registerClickHandler(rejectAutoSelectBtn, Messages.REJECT_AUTO_SELECT, toggleAutoselectConfirmation)
    registerClickHandler(zoomInBtn, Messages.ZOOM_IN);
    registerClickHandler(zoomOutBtn, Messages.ZOOM_OUT);
    registerClickHandler(zoomPrevBtn, Messages.ZOOM_PREV);
    registerClickHandler(zoomNextBtn, Messages.ZOOM_NEXT);
    registerInputHandler(
        submitTextSearchContainsBtn,
        textSearchContainsInput,
        Messages.TEXT_SEARCH_CONTAINS,
        containsExactCheck
    );
    registerInputHandler(
        submitTextSearchStartsBtn,
        textSearchStartsInput,
        Messages.TEXT_SEARCH_STARTS
    );
    registerInputHandler(
        submitTextSearchEndsBtn,
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
            case Messages.SELECTED:
                toggleDOMNavigation(true);
                break;
            case Messages.UNSELECTED_CURRENT:
                toggleDOMNavigation(false);
                break;
            default:
                console.error('Unknown message from controller!');
        }
    });
});