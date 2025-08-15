// Background script (service worker)
console.log('RewordAI background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        console.log('RewordAI extension installed');
        
        // Set default settings
        chrome.storage.local.set({
            defaultStyle: 'professional',
            autoSave: true,
            apiKey: '' // You would store your AI API key here
        });
    }
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Background received message:', request);
    
    switch (request.action) {
        case 'captureSelectedText':
            // Store the captured text for the popup to access
            chrome.storage.local.set({
                capturedText: request.text,
                captureTime: Date.now()
            });
            
            // Optionally show a notification
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'RewordAI',
                message: 'Text captured! Click the extension icon to reword it.'
            });
            break;
            
        case 'getCapturedText':
            chrome.storage.local.get(['capturedText', 'captureTime'], function(result) {
                sendResponse({
                    text: result.capturedText || '',
                    timestamp: result.captureTime || 0
                });
            });
            return true; // Keep the message channel open for async response
            
        case 'clearCapturedText':
            chrome.storage.local.remove(['capturedText', 'captureTime']);
            break;
            
        case 'rewordText':
            // Handle text rewording (placeholder for AI API integration)
            handleRewording(request.text, request.style)
                .then(result => sendResponse({ success: true, text: result }))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true; // Keep the message channel open for async response
    }
});

// Handle text rewording (placeholder implementation)
async function handleRewording(text, style) {
    // This is where you would integrate with an AI API
    // For now, we'll use a simple transformation
    
    console.log(`Rewording text with style: ${style}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let rewordedText = text;
    
    // Simple transformations based on style
    switch (style) {
        case 'professional':
            rewordedText = text
                .replace(/\b(?:I think|maybe|sort of|kind of)\b/gi, '')
                .replace(/\b(?:very|really|quite)\b/gi, '')
                .replace(/\b(?:awesome|amazing|incredible)\b/gi, 'excellent');
            break;
            
        case 'casual':
            rewordedText = text
                .replace(/\b(?:utilize|implement|facilitate)\b/gi, (match) => {
                    const replacements = {
                        'utilize': 'use',
                        'implement': 'put in place',
                        'facilitate': 'help'
                    };
                    return replacements[match.toLowerCase()] || match;
                })
                .replace(/\b(?:commence|terminate)\b/gi, (match) => {
                    const replacements = {
                        'commence': 'start',
                        'terminate': 'end'
                    };
                    return replacements[match.toLowerCase()] || match;
                });
            break;
            
        case 'creative':
            rewordedText = text
                .replace(/\b(?:good|bad|nice|great)\b/gi, (match) => {
                    const replacements = {
                        'good': 'excellent',
                        'bad': 'disappointing',
                        'nice': 'wonderful',
                        'great': 'outstanding'
                    };
                    return replacements[match.toLowerCase()] || match;
                })
                .replace(/\b(?:said|told)\b/gi, (match) => {
                    const alternatives = ['mentioned', 'explained', 'shared', 'noted'];
                    return alternatives[Math.floor(Math.random() * alternatives.length)];
                });
            break;
            
        case 'formal':
            rewordedText = text
                .replace(/\b(?:use|help|start)\b/gi, (match) => {
                    const replacements = {
                        'use': 'utilize',
                        'help': 'facilitate',
                        'start': 'commence'
                    };
                    return replacements[match.toLowerCase()] || match;
                })
                .replace(/\b(?:end|stop)\b/gi, (match) => {
                    const replacements = {
                        'end': 'terminate',
                        'stop': 'cease'
                    };
                    return replacements[match.toLowerCase()] || match;
                });
            break;
    }
    
    return rewordedText;
}

// Handle browser action click
chrome.action.onClicked.addListener(function(tab) {
    // This will only trigger if there's no popup defined in manifest
    console.log('Extension icon clicked');
});

// Optional: Add context menu for right-click
chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: 'rewordSelection',
        title: 'Reword with AI',
        contexts: ['selection']
    });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === 'rewordSelection') {
        const selectedText = info.selectionText;
        
        // Store the selected text
        chrome.storage.local.set({
            capturedText: selectedText,
            captureTime: Date.now()
        });
        
        // Open the popup or send message to it
        chrome.action.openPopup();
    }
}); 