# RewordAI

A Chrome extension that uses the OpenAI API to reword and enhance text in multiple writing styles. Select text anywhere on the web, choose a tone, and get AI-powered rewrites instantly.

---

## Features

- **OpenAI GPT Integration** — Powered by GPT-4o Mini, GPT-4o, or GPT-4.1 Mini (configurable in Settings)
- **8 Writing Styles** — Professional, Casual, Creative, Formal, Academic, Simplified, Persuasive, Friendly
- **Text Capture** — Select text on any webpage and send it to the extension with `Alt+Shift+R`
- **Context Menu** — Right-click selected text and choose "Reword with RewordAI"
- **Settings Panel** — Manage your API key and model selection directly from the popup
- **Auto-save** — Input text and style preferences persist between sessions
- **Keyboard Shortcuts** — `Ctrl+Enter` to reword, `Alt+Shift+R` to capture text from pages (customizable at `chrome://extensions/shortcuts`)
- **Copy to Clipboard** — One-click copy of the reworded output
- **Local Test Mode** — Preview the UI and test API calls without loading into Chrome

---

## Quick Start

### 1. Icons

PNG icons are included in `icons/`. To regenerate them with a custom design, open `create_icons.html` in a browser and replace the files in `icons/`.

### 2. Get an OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click **"Create new secret key"** and copy the key (starts with `sk-...`)
4. Make sure billing is enabled under **Settings > Billing**

### 3. Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top right)
3. Click **"Load unpacked"**
4. Select the `RewordAI` project folder
5. Pin the extension by clicking the puzzle-piece icon in the toolbar and pinning RewordAI

### 4. Configure

1. Click the **RewordAI** icon in your toolbar
2. Click the **gear icon** (top right) to open the Settings panel
3. Paste your OpenAI API key
4. Choose a model (GPT-4o Mini is recommended — fast and cheap)
5. Click **Save Settings**

---

## Usage

### Basic Rewording

1. Click the RewordAI extension icon
2. Type or paste text into the input area
3. Select a writing style from the dropdown
4. Click **Reword** (or press `Ctrl+Enter`)
5. Copy the result with the copy button

### Capture Text from Web Pages

1. Select text on any webpage
2. Press `Alt+Shift+R` to capture it (the popup opens with the text loaded), **or** right-click and choose **"Reword with RewordAI"**
3. Open the extension popup — the captured text will be loaded automatically

### Settings

Click the gear icon in the header to configure:

| Setting   | Options                                                                 |
|-----------|-------------------------------------------------------------------------|
| API Key   | Your OpenAI API key (stored locally in Chrome storage, never shared)    |
| Model     | GPT-4o Mini (fast/cheap) · GPT-4o (best quality) · GPT-4.1 Mini        |

---

## Local Testing (Without Chrome)

You can preview the full UI and test OpenAI API calls without loading the extension into Chrome:

1. Open `test-local.html` in any browser (double-click the file)
2. The extension popup renders in the center of the page
3. Open Settings, enter your API key, and test rewording

Chrome-specific features (text capture, context menu) are not available in local test mode, but the UI, settings, and API integration all work.

---

## Writing Styles

| Style        | What It Does                                                    |
|--------------|-----------------------------------------------------------------|
| Professional | Clear, concise business language — removes filler and hedging   |
| Casual       | Conversational tone, like talking to a friend                   |
| Creative     | Vivid, expressive language with metaphors and imagery           |
| Formal       | Sophisticated vocabulary for official or academic contexts      |
| Academic     | Scholarly, objective language for research papers and essays    |
| Simplified   | Plain language with short sentences — easy for everyone         |
| Persuasive   | Compelling, impactful language with call-to-action phrasing     |
| Friendly     | Warm, approachable, and encouraging tone                        |

---

## File Structure

```
RewordAI/
├── manifest.json        # Chrome extension manifest (Manifest V3)
├── popup.html           # Extension popup UI
├── popup.js             # Popup logic and settings
├── styles.css           # UI styling (CSS custom properties)
├── background.js        # Service worker: OpenAI API calls, context menu, capture shortcut
├── test-local.html      # Standalone local test page (mocks Chrome APIs)
├── create_icons.html    # PNG icon generator tool
├── icons/
│   ├── icon.svg         # Source icon (SVG)
│   ├── icon16.png       # 16×16 icon (generated)
│   ├── icon32.png       # 32×32 icon (generated)
│   ├── icon48.png       # 48×48 icon (generated)
│   ├── icon128.png      # 128×128 icon (generated)
│   └── README.md        # Icon instructions
├── README.md            # This file
```

---

## How It Works

1. **`popup.js`** sends the user's text and selected style to the background service worker, which calls the [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat)
2. Each style maps to a specific **system prompt** that instructs GPT how to rewrite the text
3. **`background.js`** creates the right-click context menu and handles the `Alt+Shift+R` command, reading the selection from the active tab (via `activeTab` + `scripting`, so no script runs on every page) and storing it in `chrome.storage`
4. All API calls happen in the service worker, so there is a single place for prompts and error handling
5. When the popup opens, it checks for captured text and loads it into the input area automatically

---

## API Configuration

| Parameter     | Value                                          |
|---------------|------------------------------------------------|
| Endpoint      | `https://api.openai.com/v1/chat/completions`   |
| Default Model | `gpt-4o-mini`                                  |
| Temperature   | `0.7`                                          |
| Max Tokens    | `4096`                                         |
| Max Input     | `12,000` characters                            |

Error handling covers common API issues with user-friendly messages:

| HTTP Status | Message Shown                                     |
|-------------|---------------------------------------------------|
| 401         | Invalid API key. Check your key in Settings.      |
| 429 (quota) | Insufficient credits. Check your OpenAI billing.  |
| 429         | Rate limit exceeded. Please wait a moment.        |

---

## Keyboard Shortcuts

| Shortcut               | Where       | Action                  |
|------------------------|-------------|-------------------------|
| `Ctrl/Cmd + Enter`     | Popup       | Reword the input text   |
| `Alt + Shift + R`      | Any webpage | Capture selected text   |
| `Esc`                  | Popup       | Close the Settings panel |

---

## Permissions

| Permission      | Why It's Needed                                    |
|-----------------|----------------------------------------------------|
| `activeTab`     | Access the current tab to get selected text         |
| `storage`       | Save API key, preferences, and captured text        |
| `contextMenus`  | "Reword with RewordAI" right-click menu item       |
| `scripting`     | Read the selected text when you press the shortcut  |

The `host_permissions` entry for `https://api.openai.com/*` allows the extension to make API calls to OpenAI.

---

## Browser Compatibility

- Google Chrome 88+ (Manifest V3)
- Microsoft Edge 88+ (Chromium-based)
- Brave, Vivaldi, Opera, Arc, and other Chromium-based browsers

---

## Development

### Debugging

| What to Debug     | How                                                                         |
|-------------------|-----------------------------------------------------------------------------|
| Popup UI & JS     | Right-click the extension popup → **Inspect**                              |
| Background worker | `chrome://extensions/` → click **"Inspect views: service worker"**         |
| Network requests  | Open popup DevTools → **Network** tab → click Reword to see API calls      |

### Reloading After Changes

1. Go to `chrome://extensions/`
2. Click the **refresh icon** (circular arrow) on the RewordAI card
3. Close and reopen the popup to see changes

---

## Privacy

- Your API key is stored **locally** in Chrome's extension storage — it is never sent anywhere except to the OpenAI API
- Text is sent **directly** from your browser to OpenAI — no intermediary server
- **Zero** analytics, tracking, or data collection

---

## Author

**Sherin Dehghani**
Email: [shirin.dehghani1996@gmail.com](mailto:shirin.dehghani1996@gmail.com)

---

## Contributing

Ideas, bug reports and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

[MIT](LICENSE)
