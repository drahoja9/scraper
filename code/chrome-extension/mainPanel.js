


// ========================================================================================================


$(function () {
    const selectElementsBtn = document.querySelector('#select-elements-btn');

    selectElementsBtn.addEventListener('click', function () {
        window.parent.postMessage({ type: FROM_IFRAME, msg: SELECT_ELEMENTS }, '*');
    });
});