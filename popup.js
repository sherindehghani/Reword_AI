document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');
    const textOutput = document.getElementById('textOutput');
    const styleSelect = document.getElementById('styleSelect');
    const rewordBtn = document.getElementById('rewordBtn');
    const copyBtn = document.getElementById('copyBtn');
    const status = document.getElementById('status');

    // Load saved text from storage
    chrome.storage.local.get(['savedText', 'savedStyle'], function(result) {
        if (result.savedText) {
            textInput.value = result.savedText;
        }
        if (result.savedStyle) {
            styleSelect.value = result.savedStyle;
        }
    });

    // Save text to storage when input changes
    textInput.addEventListener('input', function() {
        chrome.storage.local.set({
            savedText: textInput.value,
            savedStyle: styleSelect.value
        });
    });

    styleSelect.addEventListener('change', function() {
        chrome.storage.local.set({
            savedText: textInput.value,
            savedStyle: styleSelect.value
        });
    });

    // Reword button click handler
    rewordBtn.addEventListener('click', async function() {
        const text = textInput.value.trim();
        const style = styleSelect.value;

        if (!text) {
            showStatus('Please enter some text to reword.', 'error');
            return;
        }

        rewordBtn.disabled = true;
        rewordBtn.textContent = 'Processing...';
        showStatus('Processing your text...', 'loading');

        try {
            const rewordedText = await rewordText(text, style);
            textOutput.value = rewordedText;
            copyBtn.disabled = false;
            showStatus('Text reworded successfully!', 'success');
        } catch (error) {
            console.error('Error rewording text:', error);
            showStatus('Error processing text. Please try again.', 'error');
        } finally {
            rewordBtn.disabled = false;
            rewordBtn.textContent = 'Reword Text';
        }
    });

    // Copy button click handler
    copyBtn.addEventListener('click', function() {
        textOutput.select();
        document.execCommand('copy');
        showStatus('Text copied to clipboard!', 'success');
        
        // Reset status after 2 seconds
        setTimeout(() => {
            showStatus('');
        }, 2000);
    });

    // Function to reword text (placeholder implementation)
    async function rewordText(text, style) {
        // This is a placeholder implementation
        // In a real extension, you would integrate with an AI API here
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simple text transformation based on style
        let rewordedText = text;
        
        switch (style) {
            case 'professional':
                rewordedText = text.replace(/\b(?:I think|maybe|sort of|kind of)\b/gi, '');
                rewordedText = rewordedText.replace(/\b(?:very|really|quite)\b/gi, '');
                break;
            case 'casual':
                rewordedText = text.replace(/\b(?:utilize|implement|facilitate)\b/gi, (match) => {
                    const replacements = {
                        'utilize': 'use',
                        'implement': 'put in place',
                        'facilitate': 'help'
                    };
                    return replacements[match.toLowerCase()] || match;
                });
                break;
            case 'creative':
                rewordedText = text.replace(/\b(?:good|bad|nice|great)\b/gi, (match) => {
                    const replacements = {
                        'good': 'excellent',
                        'bad': 'disappointing',
                        'nice': 'wonderful',
                        'great': 'outstanding'
                    };
                    return replacements[match.toLowerCase()] || match;
                });
                break;
            case 'formal':
                rewordedText = text.replace(/\b(?:use|help|start)\b/gi, (match) => {
                    const replacements = {
                        'use': 'utilize',
                        'help': 'facilitate',
                        'start': 'commence'
                    };
                    return replacements[match.toLowerCase()] || match;
                });
                break;
        }
        
        return rewordedText;
    }

    // Function to show status messages
    function showStatus(message, type = '') {
        status.textContent = message;
        status.className = 'status';
        if (type) {
            status.classList.add(type);
        }
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to reword
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            rewordBtn.click();
        }
        
        // Ctrl/Cmd + C to copy (when output is focused)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === textOutput) {
            copyBtn.click();
        }
    });
}); 