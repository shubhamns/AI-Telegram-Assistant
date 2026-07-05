# AI-Telegram-Assistant

A multi-user AI assistant SaaS that connects Telegram, OpenAI, MongoDB, and a mobile-first React dashboard for chat, natural-language reminders, brain dumps, and workspace billing.

<img width="373" height="622" alt="image" src="https://github.com/user-attachments/assets/dc223f20-ae88-4a8f-b268-8ab1ebeebc2d" />
<img width="355" height="624" alt="image" src="https://github.com/user-attachments/assets/2de0f4ec-357e-4ede-be55-e55cfa0649cb" />
<img width="341" height="617" alt="image" src="https://github.com/user-attachments/assets/e7841a21-63a9-4170-9441-53f74a2f2f2c" />
<img width="304" height="596" alt="image" src="https://github.com/user-attachments/assets/66dcb07d-9b76-4099-a4dc-b6ae23632e78" />

## Features

- **Auth & workspaces** — register, email verification, login, JWT + refresh tokens, forgot/reset password
- **Telegram linking** — each workspace links its own Telegram chat via deep link (`/start link_<code>`)
- **AI chat** — OpenAI replies from dashboard or Telegram, scoped per workspace
- **Reminders** — natural-language creation, scheduled Telegram delivery (node-cron)
- **Brain dump** — AI task extraction from free-form text
- **Usage limits** — free vs pro plan caps on AI messages, reminders, and brain dumps
- **Stripe billing** — optional checkout and customer portal (works without Stripe keys in dev)
- **Mobile UI** — Instagram-style layout with Today, Messages, Reminders, and Settings
- Telegram bot (polling locally, webhook in production)
- Docker + Docker Compose
- GitHub Actions CI/CD

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, TypeScript, Ant Design Mobile, TanStack Query, React Router |
| Backend | Node.js, Express, TypeScript, Mongoose, Zod, JWT, bcrypt, nodemailer, OpenAI SDK, Stripe |
| Database | MongoDB (local / Atlas) |
| DevOps | Docker, Docker Compose, GitHub Actions, Vercel, Render |

## Architecture

```
Telegram User → Webhook/Polling → Express API → OpenAI
                                      ↓
                              MongoDB (users, workspaces,
                              conversations, reminders)
                                      ↑
React App (Vercel) → JWT auth → Express API (Render)
```

### Backend structure (MVC)

```
backend/src/
├── app.ts              # middleware + route registration
├── routes/             # route modules
├── controllers/        # request handlers
├── services/           # business logic
├── models/             # Mongoose schemas
├── middleware/         # auth, usage limits, errors
├── webhooks/           # Telegram + Stripe webhooks
└── jobs/               # reminder cron
```

## Folder Structure

```
ai-telegram-assistant/
├── frontend/          # React app
├── backend/           # Express API
├── .github/workflows/ # CI and CD
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js 22+
- npm
- MongoDB (local or Atlas)
- Telegram bot token ([BotFather](https://t.me/BotFather))
- OpenAI API key
- Gmail app password (or SMTP credentials) for verification/reset emails
- Docker (optional)
- Stripe account (optional, for billing)

---

## Auth Flow

1. **Sign up** → verification email sent → `/check-email`
2. **Verify email** → click link in email → `/verify-email?token=...`
3. **Sign in** → access token (1 day) + refresh token (7 days) stored in browser
4. **Session refresh** — expired access tokens are renewed automatically via `POST /auth/refresh`
5. **Sign out** — revokes refresh token server-side (Settings → Sign out)

Unverified users cannot sign in or access protected routes.

---

## 1. Create Telegram Bot

1. Open Telegram and search **BotFather**
2. Send `/newbot`
3. Choose a display name and a username ending in `bot`
4. Copy the bot token into `backend/.env` as `TELEGRAM_BOT_TOKEN`

Verify (replace `<TOKEN>` — never commit it):

```
GET https://api.telegram.org/bot<TOKEN>/getMe
```

## 2. Link Telegram to Your Workspace

1. Sign in to the dashboard
2. Go to **Settings** → **Connect Telegram**
3. Open the deep link in Telegram and tap **Start**
4. The bot links your chat to your workspace

With local polling (`TELEGRAM_MODE=polling`), the backend must be running when you tap Start.

---

## 3. OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add to `backend/.env`:

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Never expose this key in the frontend or commit it to git.

---

## 4. Email (Verification & Password Reset)

Use Gmail with an app password or any SMTP provider:

```env
EMAIL=your@gmail.com
PASS=your-gmail-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

Verification and reset links use `CLIENT_URL` as the frontend base.

---

## 5. MongoDB Setup

### Local

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or Docker Compose
docker compose up mongo -d
```

Default URI: `mongodb://localhost:27017/ai-telegram-assistant`

### MongoDB Atlas (Production)

1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create database user and allow network access
3. Copy connection string to Render env as `MONGODB_URI`

---

## 6. Run Without Docker

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your real keys — never commit .env
npm install
npm run dev
```

API: `http://localhost:<PORT>/api/v1` (default port in `.env.example` is `8001`)

### Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL to match your backend port, e.g. http://localhost:8001/api/v1
npm install
npm run dev
```

Dashboard: `http://localhost:5173`

---

## 7. Run With Docker Compose

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit both .env files with your keys
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5000/api/v1 |
| MongoDB | localhost:27017 |

Set `VITE_API_URL` to the browser-reachable backend URL (not Docker internal hostnames).

---

## 8. Telegram Modes

### Polling (Local Development)

```env
TELEGRAM_MODE=polling
```

Uses Telegram `getUpdates`. No public HTTPS URL required. Do not run polling and webhook at the same time.

### Webhook (Production)

```env
TELEGRAM_MODE=webhook
BACKEND_PUBLIC_URL=https://your-render-app.onrender.com
```

Webhook URL: `{BACKEND_PUBLIC_URL}/api/v1/webhooks/telegram`

Register webhook:

```bash
curl -X POST https://your-backend/api/v1/telegram/set-webhook \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Or set manually via Telegram API with `secret_token` matching `TELEGRAM_WEBHOOK_SECRET`.

---

## 9. Environment Variables

Copy `.env.example` → `.env` and replace placeholders. **Never commit `.env` files.**

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:8001/api/v1`) |

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | development / production / test |
| `PORT` | Server port |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_URL` | Frontend URL for CORS and email links |
| `JWT_SECRET` | Secret for signing access tokens (min 16 chars) |
| `JWT_EXPIRES_IN` | Access token lifetime (default `1d`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime (default `7d`) |
| `EMAIL` | SMTP sender email |
| `PASS` | SMTP password / app password |
| `SMTP_HOST` | SMTP host |
| `SMTP_PORT` | SMTP port |
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_MODEL` | Model name |
| `MAX_AI_CONTEXT_MESSAGES` | AI context window limit |
| `TELEGRAM_BOT_TOKEN` | Bot token from BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | Random string for webhook validation |
| `BACKEND_PUBLIC_URL` | Public backend URL (webhook mode) |
| `APP_TIMEZONE` | IANA timezone (e.g. `Asia/Kolkata`) |
| `TELEGRAM_MODE` | `polling` or `webhook` |
| `CRON_ENABLED` | `true` or `false` |
| `STRIPE_SECRET_KEY` | Stripe secret key (optional) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret (optional) |
| `STRIPE_PRO_PRICE_ID` | Stripe price ID for Pro plan (optional) |

---

## 10. API Endpoints

Base: `/api/v1`

### Public

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Sign in |
| POST | `/auth/refresh` | Rotate access + refresh tokens |
| POST | `/auth/logout` | Revoke refresh token |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password` | Reset password |
| GET | `/auth/verify-email/:token` | Verify email |
| POST | `/auth/resend-verification` | Resend verification email |
| POST | `/webhooks/telegram` | Telegram webhook receiver |
| POST | `/webhooks/stripe` | Stripe webhook receiver |

### Protected (Bearer access token)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/auth/me` | Current user + workspace |
| GET | `/dashboard/stats` | Workspace statistics |
| GET | `/telegram/status` | Telegram link status |
| GET | `/telegram/link` | Telegram deep link |
| POST | `/telegram/send` | Send message from dashboard |
| POST | `/telegram/set-webhook` | Register webhook |
| GET | `/telegram/webhook-info` | Webhook info |
| GET | `/conversations` | List conversations |
| GET | `/conversations/:id/messages` | Get messages |
| DELETE | `/conversations/:id/messages` | Clear chat history |
| GET/POST/PUT/DELETE | `/reminders` | Reminder CRUD |
| PATCH | `/reminders/:id/cancel` | Cancel reminder |
| POST | `/ai/chat` | Dashboard AI chat |
| POST | `/ai/plan` | Brain dump task extraction |
| GET | `/billing/plans` | Available plans |
| GET | `/billing/usage` | Current usage vs limits |
| POST | `/billing/checkout` | Stripe checkout session |
| POST | `/billing/portal` | Stripe customer portal |

---

## 11. Plans & Usage

| Plan | AI messages | Reminders | Brain dumps |
|------|-------------|-----------|-------------|
| Free | 50 / period | 20 | 10 |
| Pro | 500 / period | 500 | 100 |

Usage is tracked per workspace. Stripe checkout upgrades a workspace to Pro when configured.

---

## 12. Testing

```bash
# Backend
cd backend && npm test -- --run

# Frontend
cd frontend && npm test -- --run
```

Tests use in-memory MongoDB and mock external services — no real API calls.

---

## 13. CI Pipeline

File: `.github/workflows/ci.yml`

Triggers on push/PR to `main`:

1. Frontend: lint → typecheck → test → build
2. Backend: lint → typecheck → test → build
3. Docker: build frontend and backend images (no push)

---

## 14. CD Pipeline

File: `.github/workflows/deploy.yml`

Runs after successful CI on `main`:

1. Checks out the exact commit SHA that passed CI
2. Deploys frontend to **Vercel**
3. Triggers **Render** deploy hook for backend

### Required GitHub Secrets

| Secret | Purpose |
|--------|---------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `RENDER_DEPLOY_HOOK_URL` | Render deploy hook URL |

---

## 15. Vercel Deployment

1. Import the `frontend` folder as a Vercel project
2. Build command: `npm run build`
3. Output directory: `dist`
4. Env: `VITE_API_URL=https://YOUR_RENDER_BACKEND/api/v1`

---

## 16. Render Deployment

1. Create Web Service from `backend/Dockerfile`
2. Set environment variables (see below)
3. Create Deploy Hook → add URL to GitHub secret `RENDER_DEPLOY_HOOK_URL`

### Production Backend Env

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=YOUR_MONGODB_ATLAS_URI
CLIENT_URL=YOUR_VERCEL_FRONTEND_URL
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
EMAIL=YOUR_SMTP_EMAIL
PASS=YOUR_SMTP_PASSWORD
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
OPENAI_API_KEY=YOUR_SECRET
OPENAI_MODEL=gpt-4o-mini
TELEGRAM_BOT_TOKEN=YOUR_SECRET
TELEGRAM_WEBHOOK_SECRET=YOUR_RANDOM_SECRET
BACKEND_PUBLIC_URL=YOUR_RENDER_BACKEND_URL
APP_TIMEZONE=Asia/Kolkata
TELEGRAM_MODE=webhook
CRON_ENABLED=true
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET
STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET
STRIPE_PRO_PRICE_ID=YOUR_STRIPE_PRICE_ID
```

---

## 17. Free Hosting Limitations

**Render free tier services may sleep.** When the backend is asleep:

- node-cron reminders are **not guaranteed** to run on time
- Webhook requests may be delayed until the service wakes

### Future Improvements

- External cron trigger hitting a `/cron/reminders` endpoint
- Durable job queue (BullMQ + Redis)
- Managed scheduler (AWS EventBridge, etc.)

---

## 18. Security Notes

- JWT access tokens (short-lived) + hashed refresh tokens (rotated on refresh)
- Helmet, CORS allowlist, rate limiting on auth and send endpoints
- Webhook secret validation via `X-Telegram-Bot-Api-Secret-Token`
- All API data scoped by workspace
- Zod validation on inputs
- No secrets in frontend or git
- Email verification required before sign-in

---

## 19. Troubleshooting

| Issue | Fix |
|-------|-----|
| Bot not responding locally | Set `TELEGRAM_MODE=polling`, check token, link Telegram in Settings |
| Webhook 401 | Match `TELEGRAM_WEBHOOK_SECRET` with Telegram `secret_token` |
| CORS errors | Set `CLIENT_URL` to exact frontend origin |
| Login blocked | Verify email first; check inbox or resend from `/check-email` |
| Session expired | Sign in again; refresh token lasts 7 days by default |
| Reminders not firing | Check `CRON_ENABLED=true`, MongoDB connection |
| Dashboard API errors | Ensure backend is running and `VITE_API_URL` matches backend port |
| Duplicate key on conversations | Restart backend (runs index sync) or drop stale `telegramChatId_1` index |
| Verification email not sent | Check SMTP credentials in `backend/.env` |

---

## License

MIT — for learning and demonstration purposes.
