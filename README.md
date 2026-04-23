# PolicySaathi

**AI-Powered Health Insurance Assistant for India**

An intelligent assistant that helps Indian health insurance policyholders understand policies, analyze claims, and prepare cases using adversarial AI agents. Built with Next.js 14, TypeScript, Tailwind CSS, and OpenRouter AI.

---

## Features

### 1. Policy Analysis Bot
- Upload health insurance policy PDFs
- AI extracts key terms: sum insured, waiting periods, exclusions, sub-limits
- Get plain-language summaries and coverage explanations

### 2. Claim Analysis
- Enter treatment, hospital, and claim amount
- Get win probability (0-100%)
- Expected reimbursement range
- Identify loopholes, required documents, and next steps
- References IRDAI regulations and Consumer Protection Act

### 3. Lawyer Arena (Adversarial Debate)
- Watch AI lawyers debate your claim
- **PolicyGuard** (claimant's advocate) argues FOR coverage
- **PolicyChallenger** (insurer's advocate) argues AGAINST
- Judge delivers final verdict with reasoning
- Pre-prepare your case for ombudsman or consumer court

### 4. IRDAI Verify
- Search 1,642+ registered insurance entities
- Verify insurers, brokers, agents, and TPAs
- Check IRDAI registration validity

### 5. IRDAI Updates Ticker
- Live feed of latest IRDAI circulars and guidelines
- Daily automated scraping (when deployed)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3.4 |
| **Backend** | Next.js API Routes (serverless functions) |
| **AI/LLM** | OpenRouter (DeepSeek, Qwen, Moonshot models) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Email/Password + NextAuth.js Google OAuth |
| **Vector Store** | ChromaDB (RAG infrastructure, not yet integrated) |
| **Scraping** | Puppeteer (IRDAI website crawler) |
| **Styling** | Custom branded palette: Saffron #FF6B35, Ocean Blue #004E89 |

---

## Screenshots

| Landing Page | Chat Interface | Policy Management |
|--------------|---------------|-------------------|
| ![Landing](/screenshots/landing.png) | ![Chat](/screenshots/chat.png) | ![Policies](/screenshots/policies.png) |

| Claim Analysis | Lawyer Arena |
|----------------|--------------|
| ![Claims](/screenshots/claims.png) | ![Analyze](/screenshots/analyze.png) |

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+ ([Download](https://nodejs.org))
- npm or yarn
- Python 3+ (optional, for IRDAI scraper)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/policysathi_2.git
cd policysathi_2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your API keys (see Configuration section)

# Initialize database (Supabase)
# 1. Create a new Supabase project at https://supabase.com
# 2. Run the SQL in supabase-setup.sql in the Supabase SQL Editor
# 3. Copy your Supabase URL and anon key to .env.local

# Seed demo data (optional)
npm run seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Configuration

### Required Environment Variables

Create a `.env.local` file in the project root:

```env
# OpenRouter API (required for AI features)
# Get from https://openrouter.ai (free tier available)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase (required for data persistence)
# Create project at https://supabase.com, then run supabase-setup.sql
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-random-secret-here-change-this

# Optional: Google OAuth (for Google login button)
# Not required - email/password login works without it
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App URL (defaults to http://localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional Data Path Overrides

For production deployments with shared storage:

```env
USERS_FILE_PATH=/path/to/users.json
IRDAI_DB_PATH=/path/to/entities_database.json
HEADLINES_FILE_PATH=/path/to/headlines.json
SCRAPER_SCRIPT_PATH=/path/to/daily_crawl.py
```

---

## Project Structure

```
policysathi_2/
├── app/                      # Next.js 14 App Router
│   ├── (auth)/login/         # Login & Register page
│   ├── (dashboard)/
│   │   ├── chat/             # AI chat with policy context
│   │   ├── policies/         # Upload, view, compare policies
│   │   ├── claims/           # Track & analyze claims
│   │   ├── analyze/          # Lawyer Arena debate
│   │   └── verify/           # IRDAI entity verification
│   ├── api/                  # Backend API routes
│   │   ├── auth/             # Email/password auth
│   │   ├── chat/             # Streaming LLM chat
│   │   ├── upload-policy/    # Policy PDF analysis
│   │   ├── analyze-claim/    # Claim probability analysis
│   │   ├── lawyer-debate/    # Adversarial debate
│   │   ├── compare/          # Policy comparison
│   │   ├── verify/           # IRDAI entity lookup
│   │   └── headlines/        # IRDAI news ticker
│   ├── layout.tsx
│   └── page.tsx              # Landing page
├── components/               # React components
├── lib/
│   ├── config.ts             # Configuration (paths, env vars)
│   ├── db/supabase.ts        # Supabase client + CRUD
│   ├── openrouter.ts         # OpenRouter LLM client
│   └── rag/vectorStore.ts    # ChromaDB vector store (future)
├── data/                     # Data files (gitignored in prod)
│   ├── irdai/
│   │   ├── entities_database.json  # 1,642 IRDAI entities
│   │   └── headlines.json          # Latest IRDAI updates
│   └── users.json           # User accounts (local dev only)
├── scrapers/
│   └── irdaiScraper.ts      # Puppeteer-based IRDAI crawler
├── scripts/
│   ├── daily_crawl.py       # Python scraper script
│   └── seed.ts              # Database seeder (10 policies, 8 claims)
├── supabase-setup.sql        # Database schema
├── supabase-seed-data.sql    # SQL seed data
├── Dockerfile                # Docker build config
├── docker-compose.yml        # Local container setup
├── .env.example              # Environment template
└── README.md                 # This file
```

---

## Database Schema

### Tables (Supabase PostgreSQL)

**policies** — Uploaded health insurance policies
- id, user_id, insurer, plan_name, sum_insured, premium
- exclusions (array), waiting_periods (JSONB), sub_limits (JSONB)
- copay, no_claim_bonus, restoration, features
- rating, summary, analysis_date, created_at

**claims** — User claim submissions
- id, user_id, policy_id (FK), treatment, hospital, amount
- status (pending/approved/rejected), win_probability, expected_amount
- analysis (JSONB: covered, loopholes, documents_needed, etc.)

**chat_history** — Conversation logs
- id, user_id, role (user/assistant), content, policy_ids (array), created_at

> Run `supabase-setup.sql` in Supabase SQL Editor before first use.

---

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth` | Register/Login (email+password) |
| GET | `/api/verify` | List IRDAI entity statistics |
| POST | `/api/verify` | Search insurer/broker/agent |

### Protected (require auth cookie)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Streaming LLM chat |
| POST | `/api/upload-policy` | Upload PDF(s), extract policy data |
| POST | `/api/analyze-claim` | Analyze claim probability |
| POST | `/api/lawyer-debate` | Generate adversarial debate |
| POST | `/api/compare` | Compare multiple policies |
| GET | `/api/headlines` | Fetch IRDAI news |
| POST | `/api/headlines` | Trigger scraper (admin) |

---

## AI Models

Uses **OpenRouter** API with automatic fallback chain:

1. **Primary**: `deepseek/deepseek-chat` (free, fast)
2. **Fallback 1**: `qwen/qwen-2.5-72b-instruct`
3. **Fallback 2**: `moonshotai/moonshot-v1-8k`
4. **Fallback 3**: `minimax/minimax-text-01`

If a model fails (rate limit, timeout), automatically tries the next.

---

## Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint

# Database
npm run seed         # Seed demo data (10 policies, 8 claims, 15 chats)
npx supabase start   # Start local Supabase (if using local)
npx supabase db push # Push schema to Supabase

# Production (Docker)
docker build -t policysathi .
docker compose up -d

# Deployment
npm run deploy       # Deploy to Vercel (if configured)
```

---

## Data Portability

The app supports **three storage modes**:

### 1. Local Development (Default)
- Uses `./data/` folder in project root
- Files: `users.json`, `irdai/entities_database.json`, `irdai/headlines.json`
- Perfect for offline development and testing
- Data persists in repo (except `.env.local`)

### 2. Supabase (Production-Ready)
- All CRUD operations use Supabase by default
- Fallback to localStorage if Supabase unavailable
- Cloud-hosted PostgreSQL with real-time capabilities

### 3. Hybrid (Current)
- Policies + Claims → Supabase with localStorage cache
- Auth users → `data/users.json` (local JSON file)
- IRDAI data → `data/irdai/*.json` files
- Chat history → Supabase with localStorage fallback

---

## GitHub Setup

### Repository: `policysathi_2`

Already initialized locally. To push to GitHub:

```bash
# 1. Create empty repository on GitHub:
#    Go to https://github.com/new
#    Repository name: policysathi_2
#    DO NOT initialize with README, .gitignore, or license
#    Click "Create repository"

# 2. Add remote and push
git remote add origin https://github.com/yourusername/policysathi_2.git
git branch -M main
git add .
git commit -m "Initial commit: PolicySaathi AI health insurance assistant"
git push -u origin main
```

---

## Folder Explanations

- `app/` — Next.js 14 App Router pages and API routes
- `components/` — Reusable React components
- `lib/` — Utilities (config, Supabase client, LLM wrapper, vector store)
- `scrapers/` — Puppeteer-based IRDAI website scrapers
- `scripts/` — Python scripts (daily crawl, seeding)
- `data/` — JSON data files (IRDAI entities, news, user accounts)
- `public/` — Static assets (SVG icons, images)
- `supabase-setup.sql` — SQL to create tables in Supabase
- `supabase-seed-data.sql` — Sample data for testing

---

## Troubleshooting

### Build fails with "module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Chat API returns "Failed to generate response"
- Check `OPENROUTER_API_KEY` is set in `.env.local`
- Verify you have internet connectivity
- OpenRouter may be rate-limited; wait and retry

### Supabase connection errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase project is active (not paused)
- Run `supabase-setup.sql` in Supabase SQL Editor

### "Cannot find module '@/lib/config'"
- Restart dev server after creating new files
- Clear Next.js cache: `rm -rf .next`

### Scraper not working
- Python 3 must be installed
- Install requirements: `pip install beautifulsoup4 requests`
- IRDAI website structure may change; update selectors in `scrapers/irdaiScraper.ts`

---

## Security Notes

- **Demo auth**: Password hashing uses Base64 (insecure). Use bcrypt in production.
- **API keys**: `.env.local` is gitignored. Never commit real keys.
- **Data**: Local `data/` files contain user accounts. Use `.gitignore` exceptions to exclude in production.
- **Chat logs**: Stored in Supabase; implement retention policy for compliance.

---

## Future Enhancements

- [ ] **RAG Implementation**: Wire ChromaDB vector store to enable semantic search over policies
- [ ] **WhatsApp Integration**: WhatsApp OTP login + chatbot via Twilio
- [ ] **Voice Output**: TTS (text-to-speech) responses
- [ ] **PDF Upload**: Full PDF text extraction with pdf-parse (currently sends raw text to LLM)
- [ ] **User Profiles**: Complete profile management
- [ ] **Email Notifications**: Claim status updates via email
- [ ] **Mobile App**: React Native or Expo wrapper
- [ ] **Multi-language**: Hindi, Tamil, Bengali support
- [ ] **Admin Dashboard**: Manage users, view analytics, trigger scrapers

---

## License

ISC

---

## Support

This is an educational project showcasing:
- Next.js 14 App Router patterns
- AI/LLM integration with fallback strategies
- Multi-mode auth (local + OAuth)
- Supabase PostgreSQL integration
- Puppeteer web scraping
- TypeScript with strict typing
- Tailwind CSS 3.4 custom theming

**Disclaimer**: This is AI guidance, not legal advice. Always consult a licensed insurance advisor for important decisions.

---

Built with ❤️ by Deva & the PolicySaathi team
