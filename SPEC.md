# PolicySaathi — Complete Build Guide

## Project Overview

**Project Name:** PolicySaathi  
**Type:** AI-Powered Health Insurance Assistant (Web/WhatsApp/Voice)  
**Core Functionality:** An intelligent assistant that helps users understand health insurance policies, analyze claims, and argue cases using adversarial AI agents.  
**Target Users:** Indian health insurance policyholders seeking guidance on claims, policy analysis, and grievance redressal.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| AI/LLM | OpenRouter API (DeepSeek Qwen, Moonshot, Kimi) |
| Vector Store | Chroma (local) or Pinecone |
| Database | Supabase (PostgreSQL) |
| Auth | NextAuth.js (Google OAuth) + WhatsApp OTP |
| Voice | Web Speech API (free) |
| Scraping | Puppeteer (nightly cron) |
| Deployment | Vercel |

---

## Architecture

```
User (Web/WhatsApp/Voice)
       ↓
Next.js 14 Frontend (TypeScript)
       ↓
API Routes
       ↓
┌──────────────────────────────────┐
│      Agent Orchestration         │
│  LangChain + OpenRouter          │
│  ┌──────────┐  ┌──────────────┐  │
│  │ Policy   │  │ Lawyer Agent │  │
│  │ RAG Bot  │  │ (Plaintiff + │  │
│  │          │  │  Defense)    │  │
│  └──────────┘  └──────────────┘  │
└──────────────────────────────────┘
       ↓
Vector Store (Chroma/Pinecone) + Supabase Postgres
       ↓
IRDAI Scraper (Puppeteer — nightly cron)
```

---

## UI/UX Specification

### Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary | Deep Saffron | #FF6B35 |
| Secondary | Ocean Blue | #004E89 |
| Accent | Gold | #FFD700 |
| Background | Off-White | #F8F9FA |
| Dark BG | Charcoal | #1A1A2E |
| Text Primary | Dark Gray | #2D3436 |
| Text Secondary | Gray | #636E72 |
| Success | Green | #00B894 |
| Warning | Amber | #FDCB6E |
| Error | Red | #E74C3C |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Headings | Inter | 24-36px | 700 |
| Body | Inter | 16px | 400 |
| Buttons | Inter | 14px | 600 |
| Code/Mono | JetBrains Mono | 14px | 400 |

### Layout Structure

#### Pages

1. **Landing Page** (`/`)
   - Hero section with tagline
   - Features overview (3 cards)
   - CTA buttons (Get Started, Upload Policy)
   - Trust signals (IRDAI compliant badge)

2. **Login/Auth** (`/login`)
   - Google OAuth button
   - WhatsApp OTP option
   - Guest mode (limited features)

3. **Dashboard** (`/dashboard`)
   - Sidebar navigation
   - Quick stats (policies, claims, wins)
   - Recent activity feed

4. **Chat** (`/chat`)
   - Chat window (left 70%)
   - Policy quick view (right 30%)
   - Voice input button
   - File upload dropzone

5. **Policies** (`/policies`)
   - Grid of uploaded policies
   - Policy cards with rating
   - Compare button

6. **Claims** (`/claims`)
   - Claim history table
   - Status badges (Pending, Approved, Rejected)
   - Claim analysis modal

7. **Lawyer Arena** (`/analyze`)
   - Debate arena (two columns)
   - PolicyGuard vs PolicyChallenger
   - Verdict card (bottom)

---

## Functionality Specification

### 1. Policy RAG Bot

- **Input:** User uploads policy PDF or describes policy
- **Process:**
  1. Extract text from PDF using pdf-parse
  2. Chunk text into segments (overlap: 100 chars)
  3. Generate embeddings using OpenRouter (Cohere fallback)
  4. Store in Chroma vector store
  5. On query: retrieve relevant chunks + use LLM to answer
- **Output:** Plain-language policy explanation

### 2. Claim Analysis

- **Input:** Claim details (treatment, hospital, amount)
- **Process:**
  1. Map treatment to ICD-10 codes
  2. Check policy coverage (from RAG)
  3. Calculate expected reimbursement
  4. Check waiting periods (PED, initial, specific)
  5. Check sub-limits and co-payments
- **Output:**
```json
{
  "covered": true/false,
  "win_probability": 85,
  "expected_amount": "₹1.2L - ₹1.5L",
  "waiting_period_served": true,
  "key_clauses": ["Clause 4.2 - PED", "Clause 6.1 - Room rent"],
  "loopholes": ["Insurer violated 30-day timeline"],
  "documents_needed": ["Discharge summary", "Bills", "Prescription"],
  "ombudsman_applicable": true,
  "recommendation": "File claim immediately"
}
```

### 3. Lawyer Debate Agent

#### PolicyGuard (Claimant's Advocate)
- Argues FOR the policyholder
- Cites favorable IRDAI circulars
- Finds ambiguous clause interpretations in claimant's favor
- Flags insurer violations (30-day timeline, cashless everywhere)

#### PolicyChallenger (Insurer's Devil's Advocate)
- Argues FOR the insurer
- Identifies valid rejection grounds
- Flags material misrepresentation, non-disclosure

#### Debate Flow
1. PolicyGuard presents 3 arguments
2. PolicyChallenger presents 3 counterarguments
3. PolicyGuard rebuts with IRDAI citations
4. PolicyChallenger presents final objections
5. Moderator delivers VERDICT

#### Verdict Output
```json
{
  "win_probability": 75,
  "loopholes": ["Clauses 2.1 and 4.3 conflict"],
  "risks": ["Pre-existing hypertension not disclosed"],
  "policy_rating": 7,
  "next_step": "ombudsman"
}
```

### 4. IRDAI Scraper (Nightly)

- **Sources:**
  - https://irdai.gov.in/circulars
  - https://irdai.gov.in/guidelines
  - https://ncdrc.nic.in
- **Process:**
  1. Puppeteer fetches new circulars
  2. Extract text and metadata
  3. Generate embeddings
  4. Store in vector store
  5. Run via Vercel Cron (UTC 0 = IST 5:30)

### 5. Voice Features

- Input: Web Speech API (free)
- Output: Web Speech API TTS (free)
- Alternative: OpenAI TTS (paid, better quality)

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat` | Stream LLM responses |
| POST | `/api/analyze-claim` | Claim analysis |
| POST | `/api/upload-policy` | Policy PDF upload |
| POST | `/api/lawyer-debate` | Run debate |
| POST | `/api/voice` | TTS generation |

---

## Database Schema (Supabase)

### Tables

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Policies
CREATE TABLE policies (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  name TEXT,
  insurer TEXT,
  sum_insured INTEGER,
  premium INTEGER,
  policy_text TEXT,
  rating INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Claims
CREATE TABLE claims (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  policy_id UUID REFERENCES policies,
  treatment TEXT,
  hospital TEXT,
  amount INTEGER,
  status TEXT,
  analysis JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat History
CREATE TABLE chat_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  message TEXT,
  response TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Environment Variables

```env
# OpenRouter API (free models: deepseek, qwen, moonshot, kimi)
OPENROUTER_API_KEY=sk-or-v1-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Auth
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## File Structure

```
policysathi/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── callback/route.ts
│   ├── (dashboard)/
│   │   ├── chat/page.tsx
│   │   ├── policies/page.tsx
│   │   ├── claims/page.tsx
│   │   └── analyze/page.tsx
│   ├── api/
│   │   ├── chat/route.ts
│   │   ├── analyze-claim/route.ts
│   │   ├── upload-policy/route.ts
│   │   └── lawyer-debate/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── VoiceButton.tsx
│   │   └── PolicyUploader.tsx
│   ├── lawyer/
│   │   ├── DebateArena.tsx
│   │   └── VerdictCard.tsx
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       └── card.tsx
├── lib/
│   ├── agents/
│   │   ├── policyBot.ts
│   │   ├── lawyerAgent.ts
│   │   └── scraperAgent.ts
│   ├── rag/
│   │   ├── vectorStore.ts
│   │   └── ingest.ts
│   ├── openrouter.ts
│   └── db/
│       └── supabase.ts
├── scrapers/
│   └── irdaiScraper.ts
├── public/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## Acceptance Criteria

1. **Policy Upload:** User can upload PDF, receive plain-language summary
2. **Claim Analysis:** User gets win probability, expected amount, loopholes
3. **Debate Arena:** PolicyGuard vs PolicyChallenger debate completes with verdict
4. **Voice:** User can speak queries, receive spoken responses
5. **IRDAI Data:** Vector store updated with latest circulars (nightly)
6. **Responsive:** Works on mobile (375px) to desktop (1920px)
7. **Performance:** Chat response < 3 seconds (LLM streaming)

---

## Compliance

- Always display: "This is AI guidance, not legal advice."
- Follow IRDAI (Health Insurance) Regulations 2016
- Follow Consumer Protection Act 2019
- Section 45 of Insurance Act 1938 (moratorium)
- Arogya Sanjeevani Standard Policy guidelines
