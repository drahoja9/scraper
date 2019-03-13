


// ========================================================================================================


$(function () {
    const selectElementsBtn = document.querySelector('#select-elements-btn');

    selectElementsBtn.addEventListener('click', function () {
        window.parent.postMessage({ type: FROM_MAIN_PANEL, msg: SELECT_ELEMENTS }, '*');
    });
});