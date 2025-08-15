// Content script that runs on web pages
console.log('RewordAI extension loaded');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getSelectedText') {
        const selectedText = window.getSelection().toString();
        sendResponse({ text: selectedText });
    }
});

// Add context menu for selected text
document.addEventListener('mouseup', function() {
    const selectedText = window.getSelection().toString().trim();
    
    if (selectedText.length > 0) {
        // You could add a floating button or context menu here
        // For now, we'll just log the selection
        console.log('Selected text:', selectedText);
    }
});

// Add keyboard shortcut to capture selected text
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Shift + R to capture selected text
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        const selectedText = window.getSelection().toString().trim();
        
        if (selectedText.length > 0) {
            // Send selected text to the extension
            chrome.runtime.sendMessage({
                action: 'captureSelectedText',
                text: selectedText
            });
        }
    }
});

// Highlight text that might need rewording
function highlightWeakWords() {
    const weakWords = [
        'very', 'really', 'quite', 'sort of', 'kind of', 'maybe', 'I think',
        'utilize', 'implement', 'facilitate', 'good', 'bad', 'nice', 'great'
    ];
    
    const textNodes = document.evaluate(
        '//text()[normalize-space(.)!=""]',
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null
    );
    
    for (let i = 0; i < textNodes.snapshotLength; i++) {
        const node = textNodes.snapshotItem(i);
        const text = node.textContent;
        
        weakWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            if (regex.test(text)) {
                // You could add highlighting here
                console.log(`Found weak word "${word}" in:`, text.substring(0, 50) + '...');
            }
        });
    }
}

// Run highlighting on page load (optional)
// highlightWeakWords(); 