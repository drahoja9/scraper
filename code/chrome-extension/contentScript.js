function _toggleEventListener(eventType, turnOn, toggleFunc) {
    if (turnOn) {
        document.addEventListener(eventType, toggleFunc);
    } else {
        document.removeEventListener(eventType, toggleFunc);
    }
}

function onHoverHighlighting(turnOn) {
    const toggleFunc = (event) => { event.target.classList.toggle('to-scrape-highlighting'); };
    _toggleEventListener('mouseover', turnOn, toggleFunc);
    _toggleEventListener('mouseout', turnOn, toggleFunc);
}

function onClickChoosing(turnOn) {
    _toggleEventListener('click', turnOn, (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.target.classList.toggle('to-scrape-chosen');
    });
}


// ========================================================================================================


$(function () {
    // onHoverHighlighting(true);
    // onClickChoosing(true);
});
