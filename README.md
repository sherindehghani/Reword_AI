# RewordAI

A Chrome extension that uses OpenAI GPT to reword and enhance text in multiple writing styles. Select text anywhere on the web, choose a tone, and get AI-powered rewrites instantly.

## Features

- **OpenAI GPT Integration** - Powered by GPT-4o Mini, GPT-4o, or GPT-3.5 Turbo (configurable)
- **8 Writing Styles** - Professional, Casual, Creative, Formal, Academic, Simplified, Persuasive, Friendly
- **Text Capture** - Select text on any webpage and send it to the extension with `Ctrl+Shift+R`
- **Context Menu** - Right-click selected text and choose "Reword with RewordAI"
- **Auto-save** - Input text and style preferences persist between sessions
- **Settings Panel** - Manage your API key and model selection from the popup
- **Keyboard Shortcuts** - `Ctrl+Enter` to reword, `Ctrl+Shift+R` to capture text from pages
- **Copy to Clipboard** - One-click copy of the reworded output

## Screenshots

The extension popup features a clean, modern interface with:
- Gradient header with settings gear icon
- Collapsible settings panel for API key and model configuration
- Input/output text areas with character count
- Style dropdown and reword button
- Status bar with keyboard shortcut hints

## Installation

### Prerequisites

You need an OpenAI API key. Get one at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

### Load the Extension

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/RewordAI.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in the top right)

4. Click **Load unpacked** and select the `RewordAI` folder

5. Click the extension icon in your toolbar, open **Settings**, and enter your OpenAI API key

### Icons

The extension expects PNG icons at `icons/icon16.png`, `icon32.png`, `icon48.png`, and `icon128.png`. An SVG source (`icons/icon.svg`) is provided. You can convert it using any image editor or an online SVG-to-PNG converter.

## Usage

### Basic

1. Click the RewordAI extension icon
2. Type or paste text into the input area
3. Select a writing style from the dropdown
4. Click **Reword** (or press `Ctrl+Enter`)
5. Copy the result with the copy button

### Capture from Web Pages

1. Select text on any webpage
2. Press `Ctrl+Shift+R` to capture it, or right-click and choose **Reword with RewordAI**
3. Open the extension popup - the captured text will be loaded automatically

### Settings

Click the gear icon in the header to configure:
- **API Key** - Your OpenAI API key (stored locally in Chrome storage)
- **Model** - Choose between GPT-4o Mini (fast/cheap), GPT-4o (best quality), or GPT-3.5 Turbo

## File Structure

```
RewordAI/
├── manifest.json      # Chrome extension manifest (Manifest V3)
├── popup.html         # Extension popup interface
├── popup.js           # Popup logic, OpenAI API calls, settings management
├── styles.css         # UI styling
├── background.js      # Service worker: context menu, message handling, API calls
├── content.js         # Content script: text selection capture, keyboard shortcuts
├── icons/
│   ├── icon.svg       # Source icon (SVG)
│   └── README.md      # Icon creation instructions
└── README.md
```

## How It Works

1. **Popup (`popup.js`)** sends text and the selected style to the OpenAI Chat Completions API
2. Each style maps to a specific system prompt that instructs GPT how to rewrite the text
3. **Background (`background.js`)** handles the context menu, stores captured text, and can also process rewording requests
4. **Content script (`content.js`)** listens for `Ctrl+Shift+R` on web pages and sends selected text to the background script
5. When the popup opens, it checks for captured text and loads it into the input area

## API Configuration

The extension calls the [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat):

| Parameter     | Value                           |
|---------------|---------------------------------|
| Endpoint      | `https://api.openai.com/v1/chat/completions` |
| Default Model | `gpt-4o-mini`                   |
| Temperature   | `0.7`                           |
| Max Tokens    | `2048`                          |

API errors are handled with user-friendly messages for common issues (invalid key, rate limits, insufficient credits).

## Writing Styles

| Style        | Description                                                |
|--------------|------------------------------------------------------------|
| Professional | Clear, concise business language without filler words      |
| Casual       | Conversational tone, like talking to a friend              |
| Creative     | Vivid, expressive language with metaphors and imagery      |
| Formal       | Sophisticated vocabulary for official/academic contexts    |
| Academic     | Scholarly, objective language for research and essays      |
| Simplified   | Plain language with short sentences, easy for everyone     |
| Persuasive   | Compelling, impactful language with call-to-action phrasing|
| Friendly     | Warm, approachable, and encouraging tone                   |

## Permissions

| Permission     | Purpose                                      |
|----------------|----------------------------------------------|
| `activeTab`    | Access the current tab to get selected text   |
| `storage`      | Save API key, preferences, and captured text  |
| `contextMenus` | "Reword with RewordAI" right-click menu item |
| `notifications`| (Optional) Notify when text is captured       |

Host permission for `https://api.openai.com/*` is required to make API calls.

## Keyboard Shortcuts

| Shortcut               | Context     | Action                         |
|------------------------|-------------|--------------------------------|
| `Ctrl/Cmd + Enter`     | Popup       | Reword the input text          |
| `Ctrl/Cmd + Shift + R` | Any webpage | Capture selected text           |

## Browser Compatibility

- Google Chrome 88+ (Manifest V3)
- Microsoft Edge 88+ (Chromium-based)
- Other Chromium-based browsers (Brave, Vivaldi, Opera, Arc)

## Development

### Debugging

1. Open `chrome://extensions/`
2. Click **Inspect views: service worker** to debug `background.js`
3. Right-click the extension popup and choose **Inspect** to debug `popup.js` and `styles.css`
4. Open DevTools on any page to see `content.js` logs

### Making Changes

After editing files, go to `chrome://extensions/` and click the refresh icon on the RewordAI card to reload the extension.

## Privacy

- Your OpenAI API key is stored locally in Chrome's extension storage and is never sent anywhere except to OpenAI's API
- Text is sent directly from your browser to OpenAI's API - no intermediary server
- No analytics, tracking, or data collection of any kind

## License

MIT License. See [LICENSE](LICENSE) for details.
