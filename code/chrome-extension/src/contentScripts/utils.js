export function isValid(node) {
    const isNotScript = node => node.tagName.toLowerCase() !== 'script';
    const isNotHidden = node => (
        !node.hidden &&
        getComputedStyle(node).display !== 'none' &&
        node.style.display !== 'none' &&
        node.offsetWidth > 0 && node.offsetHeight > 0
    );

    return isNotScript(node) && isNotHidden(node);
}