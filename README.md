# RewordAI Chrome Extension

A powerful Chrome extension that uses AI to reword and enhance text content. Perfect for improving writing style, making text more professional, casual, creative, or formal.

## Features

- **Text Rewording**: Transform text into different styles (Professional, Casual, Creative, Formal)
- **Smart Text Capture**: Select text on any webpage and reword it instantly
- **Keyboard Shortcuts**: Quick access with Ctrl/Cmd + Shift + R
- **Context Menu**: Right-click to reword selected text
- **Auto-save**: Your text and preferences are automatically saved
- **Copy to Clipboard**: One-click copying of reworded text
- **Modern UI**: Beautiful, responsive interface with gradient design

## Installation

### For Development/Testing:


1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd rewordAI
   ```

2. **Add Extension Icons**
   - Create PNG icons in the `icons/` directory:
     - `icon16.png` (16x16)
     - `icon32.png` (32x32)
     - `icon48.png` (48x48)
     - `icon128.png` (128x128)
   - Or use the provided `create_icons.html` to generate them

3. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `rewordAI` folder

4. **Start Using**
   - Click the extension icon in your toolbar
   - Or select text on any webpage and use Ctrl/Cmd + Shift + R

### For Production:

1. **Create Icons**: Generate proper PNG icons
2. **Update API Integration**: Replace placeholder text processing with real AI API
3. **Package Extension**: Zip the folder and upload to Chrome Web Store

## Usage

### Basic Usage:
1. Click the RewordAI extension icon
2. Enter or paste text in the input field
3. Select your desired style (Professional, Casual, Creative, Formal)
4. Click "Reword Text"
5. Copy the enhanced text to your clipboard

### Advanced Usage:
- **Select text on any webpage** and press `Ctrl/Cmd + Shift + R`
- **Right-click selected text** and choose "Reword with AI"
- **Use keyboard shortcuts**: `Ctrl/Cmd + Enter` to reword, `Ctrl/Cmd + C` to copy

## File Structure

```
rewordAI/
├── manifest.json          # Extension configuration
├── popup.html            # Main extension interface
├── popup.js              # Popup functionality
├── content.js            # Content script for web pages
├── background.js         # Background service worker
├── styles.css            # Extension styling
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon.svg
├── create_icons.html     # Icon generator
└── README.md            # This file
```

## Customization

### Adding AI API Integration:

1. **Get an API Key**: Sign up for an AI service (OpenAI, Claude, etc.)
2. **Update Background Script**: Modify `background.js` to make real API calls
3. **Add API Key Storage**: Securely store your API key in extension storage

Example API integration:
```javascript
// In background.js, replace handleRewording function
async function handleRewording(text, style) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: `Rewrite this text in a ${style} style: ${text}`
            }]
        })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
}
```

### Adding New Styles:

1. **Update HTML**: Add new options to the select dropdown in `popup.html`
2. **Update JavaScript**: Add style logic in both `popup.js` and `background.js`
3. **Update CSS**: Add any style-specific styling

### Modifying the UI:

- **Colors**: Update the gradient colors in `styles.css`
- **Layout**: Modify the HTML structure in `popup.html`
- **Animations**: Add CSS animations and transitions

## Development

### Testing:
- Use Chrome DevTools to debug the extension
- Check the console for any errors
- Test on different websites and text types

### Debugging:
- Open `chrome://extensions/`
- Click "Inspect views" on your extension
- Use the DevTools console to debug

### Building for Production:
1. Create proper icons
2. Integrate with AI API
3. Test thoroughly
4. Package for Chrome Web Store

## Permissions

The extension requests these permissions:
- `activeTab`: To access the current tab's content
- `storage`: To save user preferences and text

## Browser Compatibility

- Chrome 88+ (Manifest V3)
- Edge 88+ (Chromium-based)
- Other Chromium-based browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the code comments
3. Open an issue on GitHub

---

**Note**: This extension currently uses placeholder text processing. For production use, integrate with a real AI API service.
