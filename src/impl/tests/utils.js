// ------------------------------------------------- Events -----------------------------------------------------------

export const _mouseover = (node) => {
    node.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
};

export const _mouseout = (node) => {
    node.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
};

export const _mouseenter = (node) => {
    node.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
};

export const _mouseleave = (node) => {
    node.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
};

export const _enterKeyDown = (node) => {
    node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter' }));
};

export const _click = (node) => {
    node.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true
    }));
};

export const _doubleClick = (node) => {
    node.dispatchEvent(new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true
    }));
};

export const _focusOut = (node) => {
    node.dispatchEvent(new FocusEvent('focusout', {
        bubbles: true,
        cancelable: true
    }));
};

export const _clickWithCtrl = (node) => {
    node.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        ctrlKey: true
    }));
};

export const _postMessage = (msg, payload = null) => window.dispatchEvent(
    new MessageEvent(
        'message',
        {
            data: { msg, payload },
            origin: '/src/mainPanel/mainPanel.html'
        }
    )
);

// ------------------------------------------------ Script loading ----------------------------------------------------

function removeImports(code) {
    let importIdx = code.indexOf('import');
    while (importIdx !== -1) {
        const newlineIdx = code.indexOf('\n', importIdx);
        code = code.substring(0, importIdx) + code.substring(newlineIdx + 1);
        importIdx = code.indexOf('import');
    }
    return code;
}

function removeExports(code) {
    code = code.replace(/export /g, '');
    return code;
}

function concatScripts(scripts) {
    const fs = require('fs');
    const path = require('path');

    let result = '';
    for (const script of scripts) {
        const absPath = path.resolve(__dirname, '../src/mainPanel/' + script);
        let code = fs.readFileSync(absPath, { encoding: 'utf-8' });
        code = removeImports(code);
        code = removeExports(code);
        result += code;
    }

    return result;
}

export function insertMainPanelScripts(panelDocument) {
    const mainPanelScripts = [
        '../constants.js', 'columnPool/columnName.js', 'columnPool/columnRemoveBtn.js', 'columnPool/columnNameForm.js',
        'columnPool/columnBtn.js', 'columnPool/columnPool.js', 'selectors.js', 'mainPanel.js', 'utils.js'
    ];
    const mainPanelCode = concatScripts(mainPanelScripts);

    const scriptEl = panelDocument.createElement("script");
    scriptEl.textContent = mainPanelCode;
    panelDocument.body.appendChild(scriptEl);
}
