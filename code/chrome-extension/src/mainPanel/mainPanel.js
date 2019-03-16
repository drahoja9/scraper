function sendMessageToContentScript(message, payload = null) {
    window.parent.postMessage({ type: FROM_MAIN_PANEL, msg: message, payload: payload }, '*');
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
    const acceptAutoSelectBtn = document.querySelector('#accept-auto-select');
    const rejectAutoSelectBtn = document.querySelector('#reject-auto-select');

    if (shouldEnable !== null) {
        acceptAutoSelectBtn.disabled = !shouldEnable;
        rejectAutoSelectBtn.disabled = !shouldEnable;
    } else if (acceptAutoSelectBtn.disabled) {
        acceptAutoSelectBtn.disabled = false;
        rejectAutoSelectBtn.disabled = false;
    } else {
        acceptAutoSelectBtn.disabled = true;
        rejectAutoSelectBtn.disabled = true;
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


    toggleAutoselectConfirmation();

    registerClickHandler(selectElementsBtn, SELECT_ELEMENTS)
    registerClickHandler(acceptAutoSelectBtn, ACCEPT_AUTO_SELECT, toggleAutoselectConfirmation)
    registerClickHandler(rejectAutoSelectBtn, REJECT_AUTO_SELECT, toggleAutoselectConfirmation)
    registerClickHandler(zoomInBtn, ZOOM_IN);
    registerClickHandler(zoomOutBtn, ZOOM_OUT);
    registerClickHandler(zoomPrevBtn, ZOOM_PREV);
    registerClickHandler(zoomNextBtn, ZOOM_NEXT);
    registerInputHandler(
        submitTextSearchContainsBtn,
        textSearchContainsInput,
        TEXT_SEARCH_CONTAINS,
        containsExactCheck
    );
    registerInputHandler(
        submitTextSearchStartsBtn,
        textSearchStartsInput,
        TEXT_SEARCH_STARTS
    );
    registerInputHandler(
        submitTextSearchEndsBtn,
        textSearchEndsInput,
        TEXT_SEARCH_ENDS
    );

    window.addEventListener('message', (event) => {
        if (event.data.type !== FROM_CONTROLLER) {
            return;
        }
        switch (event.data.msg) {
            case DECIDE_AUTO_SELECT:
                toggleAutoselectConfirmation(true);
                break;
            default:
                console.error('Unknown message from controller!');
        }
    });
});