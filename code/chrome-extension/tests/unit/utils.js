export const _areSelected = (selectEngine, selected) => {
    let nodes = [document.body];
    while (nodes.length !== 0) {
        let current = nodes.pop();
        for (let child of current.children) {
            if (selected.includes(child)) {
                expect(selectEngine.areSelected([child])).toBe(true);
            } else {
                expect(selectEngine.areSelected([child])).toBe(false);
            }
            nodes.push(child);
        }
    }
};

export const _mouseover = (node) => {
    node.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
}

export const _mouseout = (node) => {
    node.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
}

export const _click = (node) => {
    node.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true
    }));
}

export const _clickWithCtrl = (node) => {
    node.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        ctrlKey: true
    }));
}