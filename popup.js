document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const textOutput = document.getElementById('textOutput');
    const styleSelect = document.getElementById('styleSelect');
    const rewordBtn = document.getElementById('rewordBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const status = document.getElementById('status');
    const charCount = document.getElementById('charCount');
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsPanel = document.getElementById('settingsPanel');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const modelSelect = document.getElementById('modelSelect');
    const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const settingsStatus = document.getElementById('settingsStatus');

    loadState();

    textInput.addEventListener('input', () => {
        updateCharCount();
        saveState();
    });

    styleSelect.addEventListener('change', saveState);

    settingsToggle.addEventListener('click', () => {
        settingsPanel.classList.toggle('hidden');
    });

    toggleKeyVisibility.addEventListener('click', () => {
        const isPassword = apiKeyInput.type === 'password';
        apiKeyInput.type = isPassword ? 'text' : 'password';
    });

    saveSettingsBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        const model = modelSelect.value;

        chrome.storage.local.set({ apiKey, model }, () => {
            settingsStatus.textContent = 'Saved!';
            setTimeout(() => { settingsStatus.textContent = ''; }, 2000);
        });
    });

    rewordBtn.addEventListener('click', handleReword);

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(textOutput.value).then(() => {
            showStatus('Copied to clipboard!', 'success');
            setTimeout(() => showStatus(''), 2000);
        }).catch(() => {
            textOutput.select();
            document.execCommand('copy');
            showStatus('Copied to clipboard!', 'success');
            setTimeout(() => showStatus(''), 2000);
        });
    });

    clearBtn.addEventListener('click', () => {
        textInput.value = '';
        textOutput.value = '';
        copyBtn.disabled = true;
        updateCharCount();
        saveState();
        showStatus('');
    });

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            rewordBtn.click();
        }
    });

    async function handleReword() {
        const text = textInput.value.trim();
        const style = styleSelect.value;

        if (!text) {
            showStatus('Please enter some text to reword.', 'error');
            return;
        }

        const settings = await getSettings();

        if (!settings.apiKey) {
            showStatus('Please add your OpenAI API key in Settings.', 'error');
            settingsPanel.classList.remove('hidden');
            return;
        }

        rewordBtn.disabled = true;
        rewordBtn.querySelector('span').textContent = 'Processing...';
        showStatus('Calling OpenAI API...', 'loading');

        try {
            const result = await callOpenAI(text, style, settings);
            textOutput.value = result;
            copyBtn.disabled = false;
            showStatus('Text reworded successfully!', 'success');
        } catch (err) {
            console.error('OpenAI API error:', err);
            showStatus(err.message || 'API error. Please try again.', 'error');
        } finally {
            rewordBtn.disabled = false;
            rewordBtn.querySelector('span').textContent = 'Reword';
        }
    }

    async function callOpenAI(text, style, settings) {
        const systemPrompt = buildSystemPrompt(style);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${settings.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: settings.model || 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: text }
                ],
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) {
                throw new Error('Invalid API key. Check your key in Settings.');
            }
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please wait a moment.');
            }
            if (response.status === 402) {
                throw new Error('Insufficient credits. Check your OpenAI billing.');
            }
            throw new Error(errorData.error?.message || `API error (${response.status})`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    function buildSystemPrompt(style) {
        const prompts = {
            professional: 'Rewrite the following text in a professional, business-appropriate tone. Use clear, concise language suitable for workplace communication. Remove filler words and hedging language. Maintain the original meaning.',
            casual: 'Rewrite the following text in a casual, conversational tone. Use simple, everyday language. Make it sound natural and friendly, like talking to a friend. Maintain the original meaning.',
            creative: 'Rewrite the following text in a creative, engaging, and vivid style. Use expressive language, metaphors, and dynamic word choices. Make it captivating and memorable. Maintain the original meaning.',
            formal: 'Rewrite the following text in a formal, sophisticated tone. Use precise vocabulary and complex sentence structures. Suitable for official documents or academic contexts. Maintain the original meaning.',
            academic: 'Rewrite the following text in an academic tone. Use scholarly vocabulary, objective language, and well-structured sentences. Suitable for research papers or academic essays. Maintain the original meaning.',
            simplified: 'Rewrite the following text in the simplest possible language. Use short sentences, common words, and clear structure. Make it easy to understand for anyone. Maintain the original meaning.',
            persuasive: 'Rewrite the following text in a persuasive, compelling tone. Use powerful language, rhetorical techniques, and call-to-action phrasing. Make it convincing and impactful. Maintain the original meaning.',
            friendly: 'Rewrite the following text in a warm, friendly, and approachable tone. Use positive language and an encouraging voice. Make the reader feel comfortable and welcomed. Maintain the original meaning.'
        };

        return prompts[style] || prompts.professional;
    }

    function getSettings() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['apiKey', 'model'], (result) => {
                resolve({
                    apiKey: result.apiKey || '',
                    model: result.model || 'gpt-4o-mini'
                });
            });
        });
    }

    function loadState() {
        chrome.storage.local.get(['savedText', 'savedStyle', 'apiKey', 'model', 'capturedText'], (result) => {
            if (result.capturedText) {
                textInput.value = result.capturedText;
                chrome.storage.local.remove(['capturedText', 'captureTime']);
            } else if (result.savedText) {
                textInput.value = result.savedText;
            }

            if (result.savedStyle) {
                styleSelect.value = result.savedStyle;
            }

            if (result.apiKey) {
                apiKeyInput.value = result.apiKey;
            }

            if (result.model) {
                modelSelect.value = result.model;
            }

            updateCharCount();
        });
    }

    function saveState() {
        chrome.storage.local.set({
            savedText: textInput.value,
            savedStyle: styleSelect.value
        });
    }

    function updateCharCount() {
        const count = textInput.value.length;
        charCount.textContent = `${count} char${count !== 1 ? 's' : ''}`;
    }

    function showStatus(message, type = '') {
        status.textContent = message;
        status.className = 'status';
        if (type) status.classList.add(type);
    }
});
