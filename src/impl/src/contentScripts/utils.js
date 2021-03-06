export function isValid(node) {
    const isNotScript = node => node.tagName.toLowerCase() !== 'script';
    const isNotHidden = node => (
        !node.hidden &&
        getComputedStyle(node).display !== 'none' &&
        getComputedStyle(node).opacity !== '0' &&
        node.style.display !== 'none' &&
        node.style.opacity !== '0' &&
        (node.offsetWidth > 0 || node.offsetHeight > 0)
    );
    const isNotProtected = node => !node.classList.contains('scraping-protected');

    return isNotScript(node) && isNotHidden(node) && isNotProtected(node);
}
