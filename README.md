# FairSign 🎵⚖️

**AI-Powered Music Contract Analyser for African Artists**

FairSign helps emerging artists from Uganda, Nigeria, Kenya, and South Africa understand their record deals and licensing contracts without needing to hire a lawyer first. Built as an AI agent project using LangGraph, LangChain, FastAPI, and Next.js.

---

## Problem Definition

Every year, thousands of emerging African artists sign record deals they don't fully understand — losing their masters, royalties, and creative freedom to a single contract. Music lawyers are expensive and inaccessible to most artists. FairSign solves this by giving every artist access to the same contract intelligence that artists with legal teams receive.

**Target Users:** Emerging music artists in Uganda, Nigeria, Kenya, and South Africa who need to understand record deals, licensing agreements, and publishing contracts before signing.

---

## What Makes FairSign Unique

No other music contract tool on the market combines all of these:

| Feature | FairSign | SoundLegal.AI | musiclawyer.ai |
|---|---|---|---|
| African market benchmarks | ✅ | ❌ | ❌ |
| Swahili / Pidgin / Luganda translation | ✅ | ❌ | ❌ |
| Negotiation Simulator with AI label rep | ✅ | ❌ | ❌ |
| Deal Readiness Score vs real labels | ✅ | ❌ | ❌ |
| Community label reputation board | ✅ | ❌ | ❌ |
| WhatsApp share | ✅ | ❌ | ❌ |
| User accounts + analysis history | ✅ | ❌ | ❌ |
| Multilingual UI (4 languages) | ✅ | ❌ | ❌ |

---

## Features

### Core Analysis (9 tabs)
| Tab | What it does |
|---|---|
| **Overview** | Deal score (1–10), key terms, market context, recommendation |
| **Red Flags** | Predatory clauses with severity, African context, negotiation language |
| **Plain English** | Every clause rewritten simply with actionable tips |
| **Ask FairSign** | Chat with your contract — ask anything about specific clauses |
| **🌍 Translate** | Analysis in Swahili (Kenya/Uganda), Nigerian Pidgin, or Luganda |
| **🥊 Simulate** | Practice negotiating with an AI label rep + real-time coaching |
| **🔴 Labels** | Community database of label reports from African artists |
| **📱 Share** | WhatsApp-formatted summary for your team |
| **📢 Promote** | Music promotion guide tailored to your market |

### Deal Readiness Score
- Fill in your streaming numbers (Audiomack, Spotify, YouTube, Instagram, TikTok)
- Get matched against a database of real African labels (Swangz Avenue, Mavin Records, Sol Generation, Def Jam Africa, and more)
- See exactly which thresholds you meet and which you're missing
- AI-generated personalised roadmap showing quickest steps to get signed
- Edit your stats anytime from the dashboard without repeating the full form

### User System
- Email + Google OAuth login with OTP email verification
- Personal dashboard with analysis history
- Stats: contracts analysed, average deal score, high-risk deals, deal readiness score
- Click any past analysis to review results again
- PDF export of full analysis
- Settings: profile, password, notification preferences, light/dark theme

### Multilingual UI
- Full interface available in English, Swahili, Nigerian Pidgin, and Luganda
- Language selector on the landing page and login screen — set once, applies everywhere
- Light/dark theme toggle applies across the entire app, not just settings

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14, TypeScript | UI and routing |
| Backend | Python 3.11, FastAPI | API server |
| AI Agent | LangGraph (StateGraph) | Agent orchestration |
| LLM | Groq (llama-3.3-70b) / OpenAI (GPT-4o) | Language model |
| Tools | LangChain function tools | Agent capabilities |
| Memory | In-memory dict + ChromaDB | Conversation + RAG |
| Database | SQLite + SQLAlchemy | User accounts + history |
| Auth | Auth.js v5 (NextAuth) | Email + Google login |
| Rate limiting | slowapi | Protect public endpoints |
| Logging | Python logging (JSON) | Structured observability |
| Tracing | LangSmith (optional) | LLM call tracing |
| PDF | PyPDF + python-docx | Contract parsing |

---

## Architecture

### How the LangGraph Agent Works

FairSign uses two LangGraph `StateGraph` instances:

#### 1. Analysis Graph (runs once per contract upload)
```
User uploads contract
        ↓
ChromaDB: fetch past user analyses → personalised context
        ↓
[agent node] — Groq/OpenAI with 4 bound tools
        ↓ (calls tools sequentially)
[tools node] — executes tool functions
        ↓ (loops back until done)
[agent node] — compiles final JSON analysis
        ↓
[parse node] — stack-based JSON extraction (handles markdown fences)
        ↓
Auto-save to SQLite + ChromaDB
        ↓
Returns to FastAPI → sent to Next.js dashboard
```

#### 2. Chat Graph (runs per message, manual history)
```
User sends question
        ↓
Ownership check: session belongs to this user?
        ↓
[agent node] — full contract + history as context
        ↓ (may call tools for specific data)
[tools node if needed]
        ↓
Response → stored in chat_histories dict (capped at 20 messages)
```

### The 4 LangChain Function Tools

| Tool | What it does |
|---|---|
| `get_market_standards(market)` | Returns industry norms for Uganda / Nigeria / Kenya / SA |
| `calculate_deal_score(params)` | Scores the deal 1–10 with per-factor breakdown |
| `search_royalty_standards(market, type)` | Fetches royalty benchmarks by income type |
| `get_negotiation_tips(clause, market)` | Returns negotiation strategy per clause type |

### RAG Implementation (ChromaDB)

Every completed analysis is embedded and stored in ChromaDB. When a logged-in user uploads a new contract, their past analysis history is retrieved as context and injected into the agent prompt:

- "Based on your past contracts, this royalty rate is lower than usual"
- Personalised recommendations improve with each analysis
- `get_user_context()` called before analysis; `store_analysis()` called after save

### JSON Parsing

LLM responses are extracted using a **stack-based parser** (`parse_json.py`) that handles:
- Plain JSON
- JSON wrapped in ` ```json ``` ` markdown fences
- JSON surrounded by conversational text
- Strings containing `{` and `}` characters

This replaces the old greedy regex `r'\{[\s\S]*\}'` which broke on multi-object responses and markdown artefacts.

---

## Security

| Area | Implementation |
|---|---|
| JWT secret | Mandatory env var — server refuses to start without `JWT_SECRET` |
| Secrets in repo | `.env.local` and `.env` excluded via `.gitignore` |
| Endpoint auth | `/api/chat` verifies session ownership; `/api/history` requires login |
| Rate limiting | `/api/analyse` 10/min, `/api/chat` 30/min, `/api/feedback` 20/min |
| Session isolation | Chat sessions are scoped to the user who created them |


---

## Project Structure

```
fairsign/
│
├── backend/                      ← Python / FastAPI
│   ├── main.py                   ← API routes (analyse, chat, history, feedback)
│   ├── auth_routes.py            ← Signup, login, Google OAuth, profile, OTP
│   ├── features.py               ← Translation, negotiation, labels, WhatsApp
│   ├── database.py               ← SQLite models (User, AnalysisHistory)
│   ├── chroma_store.py           ← ChromaDB RAG store
│   ├── parse_json.py             ← Stack-based JSON extractor
│   ├── logging_config.py         ← Structured JSON logging setup
│   ├── requirements.txt          ← Pinned, deduplicated dependencies
│   ├── pytest.ini
│   ├── .env.example
│   ├── .gitignore
│   ├── tests/
│   │   └── test_analysis.py      ← Unit + integration tests
│   └── agent/
│       ├── graph.py              ← LangGraph: 2 graphs + manual memory
│       ├── tools.py              ← 4 LangChain function tools
│       ├── prompts.py            ← All system prompts
│       └── parser.py             ← PDF / DOCX / TXT extraction
│
└── frontend/                     ← Next.js 14
    ├── auth.ts                   ← Auth.js v5 config
    ├── middleware.ts             ← Route protection
    ├── next.config.js            ← API proxy rules
    ├── .gitignore
    ├── lib/
    │   ├── i18n.ts               ← Translations (EN / Swahili / Pidgin / Luganda)
    │   └── dealReadiness.ts      ← Real African label database + scoring
    ├── contexts/
    │   └── AppContext.tsx         ← Global theme + language state
    ├── components/
    │   ├── AnalysisResults.tsx
    │   ├── ChatInterface.tsx
    │   ├── RedFlagCard.tsx
    │   ├── LanguageTranslator.tsx
    │   ├── NegotiationSimulator.tsx
    │   ├── LabelReputationBoard.tsx
    │   ├── WhatsAppShare.tsx
    │   ├── MusicPromotionGuide.tsx
    │   ├── LangThemePicker.tsx   ← Language + theme selector component
    │   ├── ThemeToggle.tsx
    │   └── HelpChatbot.tsx       ← "Dada" landing page guide
    └── app/
        ├── page.tsx              ← Marketing landing page (/)
        ├── login/page.tsx        ← Login (/login)
        ├── dashboard/page.tsx    ← Main dashboard (/dashboard)
        ├── onboarding/page.tsx   ← Deal readiness form (/onboarding)
        ├── settings/page.tsx     ← User settings (/settings)
        └── api/
            ├── auth/[...nextauth]/route.ts
            ├── artist/readiness/route.ts   ← Deal readiness persistence
            ├── roadmap/route.ts            ← AI roadmap generation proxy
            └── notifications/preferences/route.ts
```


## Running Tests

```bash
cd backend
pip install pytest
pytest tests/ -v
```

Tests cover:
- Stack-based JSON extraction (plain JSON, markdown fences, nested objects, edge cases)
- Deal score calculation with known inputs
- API endpoint response codes
- Analysis schema validation

---

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- A Groq API key (free at https://console.groq.com) **or** an OpenAI API key

### Backend Setup

```bash
cd fairsign/backend

# Create virtual environment
python -m venv venv
source venv/Scripts/activate   # Windows
source venv/bin/activate        # Mac / Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — required keys:
#   GROQ_API_KEY=gsk_...
#   JWT_SECRET=<generate a long random string>
#   SMTP_USER=   (optional, for OTP emails)
#   SMTP_PASS=   (optional)
#   LANGSMITH_API_KEY=  (optional, for LLM tracing)

# Start backend
python -m uvicorn main:app --reload --port 8000
```

> The server will **refuse to start** if `JWT_SECRET` is not set.

### Frontend Setup

```bash
cd fairsign/frontend

# Install dependencies
npm install

# Create .env.local with:
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
BACKEND_URL=http://localhost:8000
GROQ_API_KEY=gsk_...
GOOGLE_CLIENT_ID=...      
GOOGLE_CLIENT_SECRET=... 

# Start frontend
npm run dev
```

Open **http://localhost:3000**

### Environment Variables Reference

| Variable | Where | Required | Description |
|---|---|---|---|
| `JWT_SECRET` | backend `.env` | ✅ | Signs auth tokens — must be long and random |
| `GROQ_API_KEY` | both `.env` files | ✅ | Groq LLM API key |
| `NEXTAUTH_SECRET` | frontend `.env.local` | ✅ | Signs NextAuth session cookies |
| `NEXTAUTH_URL` | frontend `.env.local` | ✅ | Your app URL |
| `GOOGLE_CLIENT_ID` | frontend `.env.local` | ❌ | Google OAuth (optional) |
| `GOOGLE_CLIENT_SECRET` | frontend `.env.local` | ❌ | Google OAuth (optional) |
| `SMTP_USER` | backend `.env` | ❌ | Gmail address for OTP emails |
| `SMTP_PASS` | backend `.env` | ❌ | Gmail app password |
| `OPENAI_API_KEY` | backend `.env` | ❌ | OpenAI fallback if no Groq key |

---

## Disclaimer

FairSign is an AI tool built to help artists understand contract language. It is not legal advice. Always consult a qualified music attorney licensed in your jurisdiction before signing any contract.