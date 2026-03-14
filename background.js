chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        chrome.storage.local.set({
            defaultStyle: 'professional',
            apiKey: '',
            model: 'gpt-4o-mini'
        });
    }

    chrome.contextMenus.create({
        id: 'rewordSelection',
        title: 'Reword with RewordAI',
        contexts: ['selection']
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'captureSelectedText':
            chrome.storage.local.set({
                capturedText: request.text,
                captureTime: Date.now()
            });
            break;

        case 'getCapturedText':
            chrome.storage.local.get(['capturedText', 'captureTime'], (result) => {
                sendResponse({
                    text: result.capturedText || '',
                    timestamp: result.captureTime || 0
                });
            });
            return true;

        case 'clearCapturedText':
            chrome.storage.local.remove(['capturedText', 'captureTime']);
            break;

        case 'rewordText':
            rewordWithOpenAI(request.text, request.style)
                .then((result) => sendResponse({ success: true, text: result }))
                .catch((error) => sendResponse({ success: false, error: error.message }));
            return true;
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'rewordSelection' && info.selectionText) {
        chrome.storage.local.set({
            capturedText: info.selectionText,
            captureTime: Date.now()
        });

        chrome.action.openPopup().catch(() => {
            chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
        });
    }
});

async function rewordWithOpenAI(text, style) {
    const { apiKey, model } = await chrome.storage.local.get(['apiKey', 'model']);

    if (!apiKey) {
        throw new Error('No API key configured. Open the extension and add your OpenAI key.');
    }

    const prompts = {
        professional: 'Rewrite the following text in a professional, business-appropriate tone.',
        casual: 'Rewrite the following text in a casual, conversational tone.',
        creative: 'Rewrite the following text in a creative, engaging style.',
        formal: 'Rewrite the following text in a formal, sophisticated tone.',
        academic: 'Rewrite the following text in an academic tone.',
        simplified: 'Rewrite the following text in the simplest possible language.',
        persuasive: 'Rewrite the following text in a persuasive, compelling tone.',
        friendly: 'Rewrite the following text in a warm, friendly tone.'
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: prompts[style] || prompts.professional },
                { role: 'user', content: text }
            ],
            temperature: 0.7,
            max_tokens: 2048
        })
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error?.message || `API error (${response.status})`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}
