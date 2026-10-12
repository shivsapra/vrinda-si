# 🌿 VRINDA AI — Your Personal AI Companion

> **"Your Personal AI Companion"**  
> *Ask • Learn • Create • Grow*

VRINDA AI is a modern, peaceful, nature-inspired AI assistant built with a Node.js + Express backend and Google Gemini API integration. It offers a soothing botanical aesthetic (avoiding harsh blue or purple hues), personalized tone adjustments (**"My Tune"**), 4 rich visual themes, and local-first conversation persistence.

---

## 🌟 Key Features

1. **🌿 Serene Nature-Inspired Design**:
   - Built with deep charcoal/graphite surfaces, natural mint green accents, and botanical emblems.
   - Minimalist, distraction-free aesthetic crafted to reduce digital fatigue.
   - Mobile and laptop responsive layouts with touch-friendly navigation.

2. **👋 Personalized First-Time Welcome**:
   - Greets new users with an introductory name prompt.
   - Remembers the user's name locally and greets them personally (*"Hey Shiv! 🌿"*).
   - Display name can be updated at any time in Settings.

3. **💬 Conversational AI Workspace**:
   - Real-time responses powered by **Google Gemini** (`gemini-3.5-flash` with automatic resilience fallback).
   - Rich Markdown formatting with lists, tables, and blockquotes.
   - Code blocks with syntax highlighting, language badges, and a 1-click **"Copy Code"** button.
   - Message action toolbar:
     - 📋 **Copy**: Copies message text with instant toast confirmation.
     - 🔄 **Regenerate**: Re-runs the query for a fresh answer.
     - ⚡ **Make shorter**: Summarizes the response into a concise format.
     - 💡 **Explain simply**: Translates complex concepts into beginner-friendly explanations.
     - 📖 **More detailed**: Expands with in-depth breakdowns and examples.
     - 🎨 **Rewrite in my tune**: Rephrases the response to strictly follow your selected tone.

4. **🌿 "My Tune" — Adaptive Personalization**:
   - Choose between 6 unique response personalities:
     - **Natural**: Balanced, thoughtful, conversational.
     - **Friendly**: Warm, encouraging, approachable.
     - **Professional**: Clear, formal, structured, business-ready.
     - **Simple**: Plain language, zero jargon, intuitive analogies.
     - **Detailed**: Comprehensive, in-depth breakdowns with edge cases.
     - **Creative**: Expressive, imaginative, rich with metaphors.
   - Custom instructions field with quick preset chips (`+ Simple English`, `+ Bullet Points`, `+ Code Snippets`, etc.).

5. **🎨 4 Complete Visual Themes**:
   - **Midnight Nature (Default)**: Near-black deep charcoal background, graphite cards, mint-green accents, crisp soft text.
   - **Soft Light**: Warm off-white background, pure white cards, sage-green accents, charcoal text.
   - **Forest Calm**: Deep forest-green background, muted natural-green surfaces, soft sage highlights.
   - **Natural Earth**: Warm beige background, cream-colored cards, earthy olive-green accents, rich cocoa text.

6. **📁 Local-First Chat History**:
   - All conversations are preserved in your browser's `localStorage`.
   - Rename, delete, and search past conversations from the sidebar.
   - Export chats as clean Markdown (`.md`) or download complete JSON backups.

7. **🎓 3 Dedicated Student Modes & Predefined Questions**:
   - **Mode 1: Syllabus Tension?**: Predefined questions including high-priority *"How should I study on the last day before an exam?"* SOS, realistic handwritten-style study notes, and "Need Notes? Talk to Expert" banner.
   - **Mode 2: How to Make College Projects?**: Ideation, tech stack selection, step-by-step guides, complete 8-section report templates, and "Ask Expert to Make Your Project — FREE" with Gmail prioritization (`theeesagittarius@gmail.com`).
   - **Mode 3: I'm Confused About My Career**: Personalized career paths, step-by-step roadmaps, free courses & certifications, and placement preparation.

8. **📞 Direct Expert Contact Hub**:
   - Telegram: [`https://t.me/Hystarboy`](https://t.me/Hystarboy)
   - Gmail: [`theeesagittarius@gmail.com`](mailto:theeesagittarius@gmail.com)
   - Guaranteed: *"Free to ask 🙂"* • *"Reply within 1 hour"*.

9. **📝 Handwritten Notes Studio & 100% Offline Vault**:
   - Client-side Canvas rendering creates authentic ruled notebook pages with handwritten typography (`Caveat`/`Kalam`) and navy blue fountain pen ink.
   - 1-click PNG download & printable PDF view.
   - **Offline Study Vault & Pomodoro Focus Timer**: 100% offline local notes storage, preloaded emergency cheat sheets, and 25-minute focus timer.

10. **ℹ️ Creator & Vision ("About Us")**:
    - Connect with creator **Shiv Sapra** via the direct clickable Instagram profile: [`@hy_starrboy`](https://www.instagram.com/hy_starrboy/).

---

## 🛠️ Prerequisites & Installation

### 1. Install Node.js
VRINDA AI requires Node.js (version 18 or higher recommended).
- **Download**: Visit [https://nodejs.org](https://nodejs.org) and download the **LTS (Long Term Support)** installer for Windows.
- **Install**: Run the installer and click "Next" through the prompts, keeping the default settings checked.
- **Verify**: Open PowerShell or Command Prompt and run:
  ```powershell
  node -v
  npm -v
  ```

---

## 🚀 Step-by-Step Setup Guide (Windows)

### Step 1: Open the Project in VS Code
1. Open **Visual Studio Code**.
2. Click **File** ➔ **Open Folder...** (or press `Ctrl + K, Ctrl + O`).
3. Select this project folder (`myai`).

### Step 2: Open the Integrated Terminal
1. In VS Code, press `` Ctrl + ` `` (Control + Backtick) or go to **Terminal** ➔ **New Terminal**.
2. Ensure you are in the project root directory.

### Step 3: Install Dependencies
Run the following command in PowerShell:
```powershell
npm.cmd install
```
*(On standard Command Prompt or bash, you can simply run `npm install`)*.

---

## 🔑 Gemini API Key Configuration

To allow VRINDA AI to answer questions dynamically, you need a Google Gemini API Key.

### How to Get Your Free Gemini API Key:
1. Go to the official Google AI Studio website:  
   👉 [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account.
3. Click the **"Create API key"** button.
4. Select or create a Google Cloud project and copy your new API key string.

### Understanding `.env` vs `.env.example`
- **`.env.example`**: A public template that shows which environment variables the server expects. It contains placeholder text and is safe to commit to version control.
- **`.env`**: Your private file containing your actual secret API keys. **This file is ignored by Git (`.gitignore`) and should NEVER be shared or committed to GitHub.**

### Setting Up Your `.env` File:
1. In the project root, make sure a `.env` file exists (or copy `.env.example` to `.env`):
   ```powershell
   copy .env.example .env
   ```
2. Open `.env` and set your key and port:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   GEMINI_MODEL=gemini-3.5-flash
   PORT=3000
   ```
*(Note: A working key has already been configured in your local `.env` file for immediate use!)*

---

## 🖥️ Running VRINDA AI Locally

To start the VRINDA AI server, run:
```powershell
npm.cmd start
```

You will see the startup banner:
```
🌿 =================================================
🌿 VRINDA AI — Your Personal AI Companion is running!
🌿 URL: http://localhost:3000
🌿 Environment: development
🌿 Gemini Model: gemini-3.5-flash
🌿 API Key configured: YES ✓
🌿 =================================================
```

### Accessing the Application:
Open your web browser (Chrome, Edge, Firefox, Brave) and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

> **Important**: Do not double-click `public/index.html` directly in File Explorer. Because VRINDA AI uses an Express backend to securely safeguard your Gemini API key and handle chat requests, the application must be accessed through `http://localhost:3000`.

---

## 🩺 Testing & Health Verification

You can test whether your local server and Gemini connection are healthy at any time:

1. **Check Backend Health**:
   Open [http://localhost:3000/api/health](http://localhost:3000/api/health) in your browser. You should receive:
   ```json
   {
     "status": "ok",
     "appName": "VRINDA AI",
     "configuredModel": "gemini-3.5-flash",
     "apiKeyConfigured": true
   }
   ```

2. **In-App Health Badge**:
   Navigate to the **Settings** tab in VRINDA AI. The "AI Engine & Backend Status" card displays a live **"Online ✓ (Ready)"** status badge.

---

## 🔧 Diagnosing Common Errors

| Error Symptom | Cause | Solution |
| :--- | :--- | :--- |
| `API Key is not configured on the server` | Missing or placeholder key in `.env` | Open `.env` and set `GEMINI_API_KEY=your_key`. Restart server. |
| `Cannot connect to http://localhost:3000` | Server is not running | Run `npm.cmd start` in your terminal. |
| `Port 3000 already in use` | Another process is using port 3000 | In `.env`, change `PORT=3001` and restart. |
| `429 Too Many Requests` | Rate limit triggered (over 40 reqs/min) | Wait 30 seconds before sending another message. |
| `Execution policy error with npm` | Windows PowerShell execution restriction | Use `npm.cmd start` or `npm.cmd install`. |

---

## 🚀 Deployment Guide (Production / Cloud)

VRINDA AI can be deployed easily to modern Node.js cloud hosting platforms such as **Render**, **Railway**, **Fly.io**, or **Heroku**:

### Deploying to Render / Railway:
1. Push your project to a private GitHub repository:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit of VRINDA AI"
   git remote add origin https://github.com/yourusername/vrinda-ai.git
   git push -u origin main
   ```
2. Log into [Render](https://render.com) or [Railway](https://railway.app).
3. Create a **New Web Service** linked to your repository.
4. Set the build and start commands:
   - **Build Command**: `npm install`
   - **Start Command**: `node server/server.js`
5. **Configure Environment Variables** in the hosting dashboard:
   - `GEMINI_API_KEY` = *(your secret key)*
   - `GEMINI_MODEL` = `gemini-3.5-flash`
   - `NODE_ENV` = `production`
6. Click **Deploy**. Your app will be live on an HTTPS URL with full functionality!

---

## 📂 Project Structure

```
vrinda-ai/
├── public/
│   ├── index.html              # Core application layout, modals, and views
│   ├── styles.css              # 4 complete visual themes & responsive styling
│   ├── app.js                  # Frontend state engine, chat client, and settings
│   └── assets/
│       └── vendor/             # Self-contained offline libraries
│           ├── marked.min.js   # Fast Markdown rendering engine
│           ├── highlight.min.js# Syntax highlighter for code blocks
│           └── highlight.css   # Dark theme code block styling
├── server/
│   ├── server.js               # Express server, static serving, health endpoint
│   └── routes/
│       └── chat.js             # Secure Gemini API route with resilience fallback
├── .env                        # Private local configuration (ignored by Git)
├── .env.example                # Public environment configuration template
├── .gitignore                  # Keeps secrets and dependencies out of Git
├── package.json                # Project dependencies and npm scripts
└── README.md                   # Comprehensive guide and documentation
```

---

## 🌿 Credits & License

- **Application**: VRINDA AI — *Your Personal AI Companion*
- **Creator**: **Shiv Sapra** ([Instagram: @hy_starrboy](https://www.instagram.com/hy_starrboy/))
- **AI Engine**: Google Gemini API
- **License**: MIT
