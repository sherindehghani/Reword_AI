const DEFAULT_MODEL = 'gpt-4o-mini';
const MAX_INPUT_CHARS = 12000;

const STYLE_PROMPTS = {
    professional: 'Rewrite the following text in a professional, business-appropriate tone. Use clear, concise language suitable for workplace communication. Remove filler words and hedging language.',
    casual: 'Rewrite the following text in a casual, conversational tone. Use simple, everyday language. Make it sound natural and friendly, like talking to a friend.',
    creative: 'Rewrite the following text in a creative, engaging, and vivid style. Use expressive language and dynamic word choices. Make it captivating and memorable.',
    formal: 'Rewrite the following text in a formal, sophisticated tone. Use precise vocabulary and well-structured sentences suitable for official documents.',
    academic: 'Rewrite the following text in an academic tone. Use scholarly vocabulary, objective language, and well-structured sentences suitable for research papers.',
    simplified: 'Rewrite the following text in the simplest possible language. Use short sentences, common words, and clear structure so anyone can understand it.',
    persuasive: 'Rewrite the following text in a persuasive, compelling tone. Use powerful language and rhetorical techniques to make it convincing and impactful.',
    friendly: 'Rewrite the following text in a warm, friendly, and approachable tone. Use positive language and an encouraging voice.'
};

const PROMPT_RULES = ' Preserve the original meaning, language, and any names, numbers, or links. Return only the rewritten text, with no preamble, quotes, or explanations.';

chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
        await chrome.storage.local.set({ apiKey: '', model: DEFAULT_MODEL });
    }

    // Menus persist across updates; recreate them to avoid duplicate-id errors.
    await chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        id: 'rewordSelection',
        title: 'Reword with RewordAI',
        contexts: ['selection']
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'rewordText') {
        rewordWithOpenAI(request.text, request.style)
            .then((text) => sendResponse({ success: true, text }))
            .catch((error) => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === 'rewordSelection' && info.selectionText) {
        captureAndOpen(info.selectionText);
    }
});

chrome.commands.onCommand.addListener(async (command, tab) => {
    if (command !== 'capture-selection' || !tab?.id) return;

    let text = '';
    try {
        const [result] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => window.getSelection().toString()
        });
        text = (result?.result || '').trim();
    } catch (err) {
        // Restricted pages (chrome://, Web Store) cannot be scripted.
        console.warn('RewordAI: could not read selection', err);
    }

    captureAndOpen(text);
});

async function captureAndOpen(text) {
    if (text) {
        await chrome.storage.local.set({ capturedText: text, captureTime: Date.now() });
    }
    try {
        await chrome.action.openPopup();
    } catch {
        chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
    }
}

async function rewordWithOpenAI(text, style) {
    const { apiKey, model } = await chrome.storage.local.get(['apiKey', 'model']);

    if (!apiKey) {
        throw new Error('Please add your OpenAI API key in Settings.');
    }
    if (!text || !text.trim()) {
        throw new Error('Please enter some text to reword.');
    }
    if (text.length > MAX_INPUT_CHARS) {
        throw new Error(`Text is too long (max ${MAX_INPUT_CHARS.toLocaleString()} characters).`);
    }

    let response;
    try {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model || DEFAULT_MODEL,
                messages: [
                    { role: 'system', content: (STYLE_PROMPTS[style] || STYLE_PROMPTS.professional) + PROMPT_RULES },
                    { role: 'user', content: text }
                ],
                temperature: 0.7,
                max_tokens: 4096
            })
        });
    } catch {
        throw new Error('Network error. Check your internet connection.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 401) throw new Error('Invalid API key. Check your key in Settings.');
        if (response.status === 429) {
            throw new Error(data.error?.code === 'insufficient_quota'
                ? 'Insufficient credits. Check your OpenAI billing.'
                : 'Rate limit exceeded. Please wait a moment.');
        }
        throw new Error(data.error?.message || `API error (${response.status})`);
    }

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
        throw new Error('The API returned an empty response. Please try again.');
    }
    return content;
}
