# Setup Guide — Open Knowledge Studio v2

## Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- A modern browser (Chrome, Firefox, Safari, Edge)
- (Optional) Google API key for AI features
- (Optional) Google Cloud project for Workspace features

## Step 1: Install Dependencies

```bash
npm install
```

This installs exactly **2 runtime packages** (react, react-dom) plus build tooling (~70 total).

## Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Required for AI chat features
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Google Workspace features (Drive, Sheets, Docs, Gmail)
# Get from: https://console.cloud.google.com/apis/credentials
VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id_here
```

### Getting a Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key and paste it into `.env`

### Getting a Google OAuth Client ID

1. Go to https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth Client ID**
5. Application type: **Web application**
6. Add authorized origins: `http://localhost:3000` (and your production URL)
7. Copy the Client ID into `.env`

**Required OAuth Scopes** (configured automatically in `googleAuthService.ts`):
- `openid`, `email`, `profile`
- `https://www.googleapis.com/auth/drive.appdata`
- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/drive.readonly`
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/documents`
- `https://www.googleapis.com/auth/presentations`
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/tasks`

## Step 3: Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Step 4: Verify Features

1. **AI Chat**: Type a message and verify you get a response from Gemini
2. **Voice Input**: Click the microphone icon and speak (Chrome/Edge)
3. **Knowledge Base**: Create a new file and toggle it as "active context"
4. **Editor**: Open a file and verify the split-pane preview
5. **Search**: Press Ctrl+K and search for content
6. **Offline**: Disable network and verify the app still works
7. **Google Sign-In**: Click "Sign in" and verify Drive backup works

## Step 5: Production Build

```bash
npm run build
```

The production build is in the `dist/` folder. Deploy to any static hosting:

| Provider | Cost | Method |
|----------|------|--------|
| GitHub Pages | Free | Push `dist/` to `gh-pages` branch |
| Netlify | Free | Drag-and-drop `dist/` folder |
| Vercel | Free | `vercel --prod` |
| Cloudflare Pages | Free | Connect Git repo |
| Firebase Hosting | Free tier | `firebase deploy` |

## Troubleshooting

### "Gemini API error 403"
- Your API key may be expired or quota exceeded
- Get a new key from https://aistudio.google.com/app/apikey

### "Google sign-in popup blocked"
- Allow popups for localhost in your browser settings
- Check that the Client ID matches your Google Cloud project

### "Service Worker registration failed"
- This is non-critical — the app still works online
- Service Workers require HTTPS in production (localhost is exempt)

### "Voice input not working"
- Web Speech API requires Chrome or Edge
- Firefox requires `media.webspeech.synth.enabled = true` in about:config
- Safari has limited Web Speech support

### "KaTeX not rendering"
- Check that KaTeX CDN is loaded (internet connection required for first load)
- After first load, it's cached by the Service Worker

## Using Alternative LLM Providers

### OpenAI
```env
# In Settings UI: select "OpenAI" provider, enter your API key
# Default model: gpt-4o-mini
```

### DeepSeek (Free tier)
```env
# In Settings UI: select "DeepSeek" provider, enter your API key
# Free tier: https://platform.deepseek.com/
```

### Groq (Free tier, very fast)
```env
# In Settings UI: select "Groq" provider, enter your API key
# Free tier: https://console.groq.com/
```

### Ollama (Local, no API key needed)
```env
# In Settings UI: select "Ollama" provider
# Default endpoint: http://localhost:11434
# Default model: llama3
# Install: https://ollama.ai/
```

### Anthropic
```env
# In Settings UI: select "Anthropic" provider, enter your API key
# Default model: claude-3-5-sonnet-latest
```
