# AI Telegram Automation Assistant

A one-day MVP that connects Telegram, OpenAI, MongoDB, and a React dashboard for AI chat, natural-language reminders, and automation logging.

<img width="373" height="622" alt="image" src="https://github.com/user-attachments/assets/dc223f20-ae88-4a8f-b268-8ab1ebeebc2d" />
<img width="355" height="624" alt="image" src="https://github.com/user-attachments/assets/2de0f4ec-357e-4ede-be55-e55cfa0649cb" />
<img width="341" height="617" alt="image" src="https://github.com/user-attachments/assets/e7841a21-63a9-4170-9441-53f74a2f2f2c" />
<img width="304" height="596" alt="image" src="https://github.com/user-attachments/assets/66dcb07d-9b76-4099-a4dc-b6ae23632e78" />


## Features

- Telegram bot connection (polling locally, webhook in production)
- Receive and send Telegram messages
- AI replies via OpenAI
- Conversation history stored in MongoDB
- Natural-language reminder creation
- Scheduled Telegram reminders (node-cron)
- React dashboard with stats, conversations, reminders, and Telegram send
- Docker + Docker Compose
- GitHub Actions CI/CD

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, TypeScript, Tailwind, TanStack Query, React Router |
| Backend | Node.js, Express, TypeScript, Mongoose, Zod, OpenAI SDK |
| Database | MongoDB (local / Atlas) |
| DevOps | Docker, Docker Compose, GitHub Actions, Vercel, Render |

## Architecture

```
Telegram User → Webhook/Polling → Express API → OpenAI
                                      ↓
                                   MongoDB
                                      ↑
React Dashboard (Vercel) → Express API (Render)
```

## Folder Structure

```
ai-telegram-assistant/
├── frontend/          # React dashboard
├── backend/           # Express API + Telegram + OpenAI
├── .github/workflows/ # CI and CD pipelines
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js 22+
- npm
- MongoDB (local or Atlas)
- Telegram bot token ([BotFather](https://t.me/BotFather))
- OpenAI API key
- Docker (optional)

---

## 1. Create Telegram Bot

1. Open Telegram and search **BotFather**
2. Send `/newbot`
3. Choose a display name (e.g. `My AI Assistant`)
4. Choose a username ending in `bot` (e.g. `my_ai_assistant_bot`)
5. Copy the bot token
6. Paste it in `backend/.env` as `TELEGRAM_BOT_TOKEN`

Verify (replace `<TOKEN>` with your token — never commit it):

```
GET https://api.telegram.org/bot<TOKEN>/getMe
```

## 2. Get Telegram Chat ID

1. Open your bot in Telegram
2. Press **Start** or send `/start`
3. The bot saves your chat ID automatically
4. Or set `TELEGRAM_CHAT_ID` manually in `backend/.env`

With local polling (`TELEGRAM_MODE=polling`), start the backend and send `/start` — your chat ID is captured from the update.

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

## 4. MongoDB Setup

### Local

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or use Docker Compose (includes mongo service)
docker compose up mongo -d
```

Default URI: `mongodb://localhost:27017/ai-telegram-assistant`

### MongoDB Atlas (Production)

1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create database user and allow network access
3. Copy connection string to Render env as `MONGODB_URI`

---

## 5. Run Without Docker

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your real keys — never commit .env
npm install
npm run dev
```

API: `http://localhost:<PORT>/api/v1` (port from your `backend/.env`)

### Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env if your backend port or URL differs
npm install
npm run dev
```

Dashboard: `http://localhost:5173`

---

## 6. Run With Docker Compose

1. Copy env templates and fill in real values locally:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Edit `backend/.env` and `frontend/.env` with your keys (never commit `.env` files).

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5000/api/v1 |
| MongoDB | localhost:27017 |

**Important:** The browser calls `http://localhost:5000/api/v1`, not Docker internal hostnames.

---

## 7. Telegram Modes

### MODE A: Polling (Local Development)

```env
TELEGRAM_MODE=polling
```

- Uses Telegram `getUpdates`
- No public HTTPS URL required
- Do not run polling and webhook simultaneously

### MODE B: Webhook (Production)

```env
TELEGRAM_MODE=webhook
BACKEND_PUBLIC_URL=https://your-render-app.onrender.com
```

Webhook URL: `{BACKEND_PUBLIC_URL}/api/v1/webhooks/telegram`

Register webhook:

```bash
curl -X POST http://localhost:5000/api/v1/telegram/set-webhook
```

Or set manually via Telegram API with `secret_token` matching `TELEGRAM_WEBHOOK_SECRET`.

---

## 8. Environment Variables

Copy the `.env.example` files to `.env` and replace dummy values with your own.

**Never commit `.env` files** — they are gitignored. `.env.example` only contains placeholders safe for a public repo.

### Frontend (`frontend/.env.example` → `frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

### Backend (`backend/.env.example` → `backend/.env`)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | development / production / test |
| `PORT` | Server port |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_URL` | Frontend URL for CORS |
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_MODEL` | Model name |
| `MAX_AI_CONTEXT_MESSAGES` | Context window limit |
| `TELEGRAM_BOT_TOKEN` | Bot token from BotFather |
| `TELEGRAM_CHAT_ID` | Optional default chat ID |
| `TELEGRAM_WEBHOOK_SECRET` | Random string for webhook validation |
| `BACKEND_PUBLIC_URL` | Public backend URL (webhook mode) |
| `APP_TIMEZONE` | IANA timezone (e.g. Asia/Kolkata) |
| `TELEGRAM_MODE` | polling or webhook |
| `CRON_ENABLED` | true or false |

---

## 9. API Endpoints

Base: `/api/v1`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/dashboard/stats` | Dashboard statistics |
| GET | `/telegram/status` | Bot connection status |
| POST | `/telegram/send` | Send message from dashboard |
| POST | `/telegram/set-webhook` | Register webhook |
| GET | `/telegram/webhook-info` | Webhook info |
| POST | `/webhooks/telegram` | Telegram webhook receiver |
| GET | `/conversations` | List conversations |
| GET | `/conversations/:id/messages` | Get messages |
| GET/POST/PUT/DELETE | `/reminders` | Reminder CRUD |
| PATCH | `/reminders/:id/cancel` | Cancel reminder |

---

## 10. Testing

```bash
# Backend
cd backend && npm test -- --run

# Frontend
cd frontend && npm test -- --run
```

Tests mock OpenAI and Telegram — no real API calls.

---

## 11. CI Pipeline

File: `.github/workflows/ci.yml`

Triggers on push/PR to `main`:

1. Frontend: lint → typecheck → test → build
2. Backend: lint → typecheck → test → build
3. Docker: build frontend and backend images (no push)

---

## 12. CD Pipeline

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

## 13. Vercel Deployment

1. Import the `frontend` folder as a Vercel project
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add env: `VITE_API_URL=https://YOUR_RENDER_BACKEND/api/v1`

---

## 14. Render Deployment

1. Create Web Service from `backend/Dockerfile`
2. Set environment variables (see Production section below)
3. Create Deploy Hook in Render dashboard
4. Add hook URL to GitHub secret `RENDER_DEPLOY_HOOK_URL`

### Production Backend Env

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=YOUR_MONGODB_ATLAS_URI
CLIENT_URL=YOUR_VERCEL_FRONTEND_URL
OPENAI_API_KEY=YOUR_SECRET
OPENAI_MODEL=gpt-4o-mini
TELEGRAM_BOT_TOKEN=YOUR_SECRET
TELEGRAM_CHAT_ID=YOUR_CHAT_ID
TELEGRAM_WEBHOOK_SECRET=YOUR_RANDOM_SECRET
BACKEND_PUBLIC_URL=YOUR_RENDER_BACKEND_URL
APP_TIMEZONE=Asia/Kolkata
TELEGRAM_MODE=webhook
CRON_ENABLED=true
```

---

## 15. Free Hosting Limitations

**Render free tier services may sleep.** When the backend is asleep:

- node-cron reminders are **not guaranteed** to run at exact times
- Webhook requests may be delayed until the service wakes

This MVP uses node-cron to demonstrate scheduling locally. Do not expect guaranteed reminder delivery on free Render.

### Future Improvements

- External cron trigger (e.g. cron-job.org hitting a `/cron/reminders` endpoint)
- Durable job queue (BullMQ + Redis)
- Managed scheduler (AWS EventBridge, etc.)

---

## 16. Security Notes

- Helmet, CORS allowlist, rate limiting on send endpoint
- Webhook secret validation via `X-Telegram-Bot-Api-Secret-Token`
- Zod validation on all inputs
- No secrets in frontend or git
- Bot token and OpenAI key never exposed via API

---

## 17. Troubleshooting

| Issue | Fix |
|-------|-----|
| Bot not responding locally | Set `TELEGRAM_MODE=polling`, check token, send `/start` |
| Webhook 401 | Match `TELEGRAM_WEBHOOK_SECRET` with Telegram `secret_token` |
| CORS errors | Set `CLIENT_URL` to exact frontend origin |
| Reminders not firing | Check `CRON_ENABLED=true`, MongoDB connection |
| Dashboard empty | Ensure backend is running and `VITE_API_URL` is correct |

---

## License

MIT — for learning and demonstration purposes.
