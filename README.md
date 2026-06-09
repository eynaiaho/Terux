# Terux

**Terux** is an AI-powered smart terminal built with Rust and Tauri. Describe what you want to do in plain language, and Terux translates it into a terminal command and runs it — no syntax memorization required.

> ⚠️ **Alpha release** — Terux is in early development. Expect rough edges, missing features, and breaking changes between versions.

---

## Features

- **Natural language → command** — Type what you want to do; the AI figures out the right command for your OS and shell.
- **Bring your own AI** — Connect your own API key. Supports **Anthropic (Claude)**, **Google Gemini**, **Groq**, and **DeepSeek**.
- **Custom model selection** — Choose the exact model and service you want to use.
- **Alias support** — Personalize your prompt with a custom terminal alias.
- **Theme & font settings** — Configurable appearance saved locally.
- **Native PTY** — Real terminal emulation via `portable-pty` (PowerShell on Windows, Bash on Linux).
- **Persistent config** — Settings are saved to a local JSON config file across sessions.
- **Tabbed interface** *(UI only, not yet functional)* — Multi-tab terminal sessions are planned for a future release.

---

## Supported AI Services

| Service | Provider |
|---|---|
| Claude | Anthropic |
| Gemini | Google |
| Groq | Groq |
| DeepSeek | DeepSeek |

You supply your own API key and model name during onboarding. Terux does not proxy or store your keys anywhere other than your local config file.

---

## Supported Platforms

| Platform | Status |
|---|---|
| Windows | ✅ Supported |
| Linux | ✅ Supported |
| macOS | ⚠️ Not tested |

---

## Prerequisites

Before building, make sure you have the following installed:

- [Rust](https://rustup.rs/) (minimum `1.77.2`)
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Tauri CLI prerequisites](https://tauri.app/start/prerequisites/) for your platform

---

## Building from Source

```bash
# Clone the repository
git clone https://github.com/eynaiaho/Terux.git
cd terux

# Install frontend dependencies
npm install

# Build the application
npm run tauri build
```

The compiled binary will be in `src-tauri/target/release/`.

For development with hot-reload:

```bash
npm run tauri dev
```

---

## First Launch & Setup

On first launch, Terux will open an onboarding window where you configure:

1. **Alias** — Your display name in the terminal prompt (e.g. `Terux$john`)
2. **AI Service** — Choose Anthropic, Gemini, Groq, or DeepSeek
3. **API Key** — Your personal API key for the selected service
4. **Model** — The model name to use (e.g. `claude-3-5-sonnet-20241022`, `gemini-2.0-flash`, etc.)
5. **Theme & Font** — Appearance preferences

Settings are saved to your system's app config directory as `terux_config.json`.

---

## How It Works

You describe what you want to do. Terux sends your message to your configured AI, which returns only the command appropriate for your OS and shell. The command is injected directly into the terminal session.

```
You: list all files modified today
AI:  find . -maxdepth 1 -type f -newer $(date +%Y-%m-%d)
```

The AI is aware of your operating system and shell, so it returns the right syntax automatically.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Rust + Tauri 2 |
| Frontend | TypeScript + Vite + xterm.js |
| Terminal | portable-pty |
| AI | llm crate (multi-provider) |
| Config | JSON (serde) |

---

## Known Limitations (Alpha)

- Multi-tab sessions are not yet functional (UI only)
- macOS is untested
- No pre-built binaries yet — must build from source
- AI conversation history is kept in-memory only; it resets when the app restarts
- Error handling is minimal in some areas

---

## Roadmap

- [ ] Working multi-tab sessions
- [ ] Pre-built release binaries (`.exe`, `.deb`)
- [ ] React.js frontend rewrite (planned for v2.0.0)
- [ ] Ollama (local model) support
- [ ] Command history analysis
- [ ] macOS support

---

## Contributing

This project is in alpha. If you find a bug or have a suggestion, feel free to open an issue. Pull requests are welcome — but please open an issue first to discuss larger changes.

---

## License

To be determined.

---

## Disclaimer

Terux executes commands in a real terminal session. Always review what the AI suggests before running it. The author is not responsible for any unintended effects of executed commands.