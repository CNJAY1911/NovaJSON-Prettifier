# NovaJSON Prettifier

## Changelog

### v1.2.0
- Auto-runs on reload for all tabs, but only activates on valid JSON (object or array root)
- Robust JSON detection: works for both <pre> and raw body text
- Theme-adaptive highlight color with user color picker
- URL text management (color, font, spacing, etc.)
- Key color picker and live preview
- UI is always fixed and compact
- Prevents double-injection and overrides other JSON formatters
- Many bugfixes and UX improvements

Pretty‑print raw JSON in Chrome **on demand**. Click the toolbar button and get collapsible nodes, fast search, 6 light/dark themes, and persistent scroll — all locally, no data collected.

## ✨ Features

- **Tap‑to‑run:** Uses `activeTab` + `scripting`; runs only after you click.
- **6 Themes (3 light / 3 dark):** Midnight Neon, Graphite Dark, Solar Dark, Paper White, Slate Light, Solar Light.
- **Collapse / expand** with state memory (scroll position preserved).
- **Inline search popup** with highlight & smooth scroll to result.
- **Safe HTML strings:** Values are escaped and shown as code (never rendered).
- **Adjustable UI:** Font size slider + key color palette.
- **One‑click copy** of any node/value.
- **No remote code, no tracking, no data collection.**

## 🚀 Install

- **Chrome Web Store:** (coming soon)
- **Manual (dev mode):**
  1. Clone or download this repo
  2. Open `chrome://extensions`, enable **Developer mode**
  3. Click **Load unpacked** and select the extension folder

## 🔐 Privacy

We do not collect, transmit, or store any data. Everything runs locally in your browser.
Read the full [Privacy Policy](https://github.com/CNJAY1911/NovaJSON-Prettifier/blob/master/privacy_policy.md).

## 🛠 Contributing

PRs welcome!  
Please:
- Open an issue first for major changes
- Follow Chrome MV3 best practices

## 📜 License

MIT
