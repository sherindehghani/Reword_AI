# Contributing to RewordAI

Thanks for your interest in improving RewordAI!

## Getting started

1. Fork the repository and clone your fork.
2. Load the folder in Chrome via `chrome://extensions/` → **Developer mode** → **Load unpacked**.
3. Or open `test-local.html` in a browser to try the popup without installing it.

## Making changes

- Create a branch: `git checkout -b feature/short-description`.
- Keep changes focused; one feature or fix per pull request.
- After editing, click the refresh icon on the RewordAI card in `chrome://extensions/` and test the popup, the right-click menu, and the `Alt+Shift+R` shortcut.
- New writing styles go in `STYLE_PROMPTS` in `background.js` and the `<select id="styleSelect">` in `popup.html`.

## Reporting bugs and ideas

Open an issue describing what you expected, what happened, your browser and version, and steps to reproduce. Never paste your OpenAI API key in an issue.
