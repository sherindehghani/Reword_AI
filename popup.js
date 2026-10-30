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

        if (apiKey && !apiKey.startsWith('sk-')) {
            settingsStatus.textContent = 'Key should start with "sk-"';
            return;
        }

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
            const result = await callOpenAI(text, style);
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

    async function callOpenAI(text, style) {
        const response = await chrome.runtime.sendMessage({ action: 'rewordText', text, style });
        if (!response?.success) {
            throw new Error(response?.error || 'Unknown error. Please try again.');
        }
        return response.text;
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
                textOutput.value = '';
                chrome.storage.local.remove(['capturedText', 'captureTime']);
                chrome.storage.local.set({ savedText: result.capturedText });
            } else if (result.savedText) {
                textInput.value = result.savedText;
            }

            if (result.savedStyle && styleSelect.querySelector(`option[value="${result.savedStyle}"]`)) {
                styleSelect.value = result.savedStyle;
            }

            if (result.apiKey) {
                apiKeyInput.value = result.apiKey;
            }

            if (result.model && modelSelect.querySelector(`option[value="${result.model}"]`)) {
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
