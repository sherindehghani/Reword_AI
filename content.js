chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSelectedText') {
        sendResponse({ text: window.getSelection().toString() });
    }
});

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        const selectedText = window.getSelection().toString().trim();

        if (selectedText) {
            chrome.runtime.sendMessage({
                action: 'captureSelectedText',
                text: selectedText
            });
        }
    }
});
