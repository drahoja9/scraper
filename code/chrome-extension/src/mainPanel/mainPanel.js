


// ========================================================================================================


$(function () {
    const selectElementsBtn = document.querySelector('#select-elements-btn');
    const acceptAutoSelectBtn = document.querySelector('#accept-auto-select');
    const rejectAutoSelectBtn = document.querySelector('#reject-auto-select');
    const zoomInBtn = document.querySelector('#zoom-in');
    const zoomOutBtn = document.querySelector('#zoom-out');
    const zoomPrevBtn = document.querySelector('#zoom-prev');
    const zoomNextBtn = document.querySelector('#zoom-next');

    selectElementsBtn.addEventListener('click', function () {
        window.parent.postMessage({ type: FROM_MAIN_PANEL, msg: SELECT_ELEMENTS }, '*');
    });
    acceptAutoSelectBtn.addEventListener('click', function () {
        window.parent.postMessage({ type: FROM_MAIN_PANEL, msg: ACCEPT_AUTO_SELECT }, '*');
    });
    rejectAutoSelectBtn.addEventListener('click', function () {
        window.parent.postMessage({ type: FROM_MAIN_PANEL, msg: REJECT_AUTO_SELECT }, '*');
    });
    zoomInBtn.addEventListener('click', function () {
        window.parent.postMessage({ type: FROM_MAIN_PANEL, msg: ZOOM_IN }, '*');
    });
    zoomOutBtn.addEventListener('click', function () {
        window.parent.postMessage({ type: FROM_MAIN_PANEL, msg: ZOOM_OUT }, '*');
    });
    zoomPrevBtn.addEventListener('click', function () {
        window.parent.postMessage({ type: FROM_MAIN_PANEL, msg: ZOOM_PREV }, '*');
    });
    zoomNextBtn.addEventListener('click', function () {
        window.parent.postMessage({ type: FROM_MAIN_PANEL, msg: ZOOM_NEXT }, '*');
    });
});