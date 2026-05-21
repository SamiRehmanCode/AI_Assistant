
# AI Chatbot

AI Chatbot is a web-based chat application that uses server-side calls to large language models (OpenAI) and MongoDB for persistence. It supports user sign-in via Google (NextAuth), session management, per-message feedback, analytics dashboards, and automatic topic tagging.

**Important:** **This project requires a ChatGPT / OpenAI API key.** **API keys expire at the end of each month — make sure you renew or replace the key monthly.**

## Features

- Chat sessions with persistent messages
- Model selection and server-side LLM calls
- Feedback collection (rating, correctness, length) per message
- Automatic topic tagging for replies
- Analytics dashboard with topic and positional metrics
- Google OAuth sign-in (NextAuth)

## Quick Start

1. Clone the repo:

```bash
git clone https://github.com/SamiRehmanCode/AI_Assistant.git
cd AI_Assistant
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a local `.env` (see Environment Variables below) and populate secrets. Do NOT commit secrets to source control.

4. Start dev server:

```bash
pnpm dev
```

5. Open `http://localhost:3000`.

## Environment Variables

Set the following environment variables for local development or in your hosting provider's secret manager:

- `MONGODB_URI` — MongoDB connection string (server-side). Example:
  `mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/mydbname?retryWrites=true&w=majority`
- `OPENAI_API_KEY` — OpenAI / ChatGPT API key (server-only). **Required; note: keys expire monthly.**
- `GOOGLE_CLIENT_ID` — Google OAuth client ID for NextAuth
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret for NextAuth
- `NEXTAUTH_SECRET` — Secret used by NextAuth for signing
- `NEXTAUTH_URL` — (Optional) production URL, e.g. `https://yourdomain.com` — defaults to `http://localhost:3000` for local dev
- `TOPIC_TAGGER_MODEL` — (Optional) model id used for topic tagging (default: `gpt-4o-mini`)

Example `.env` (do not include real secrets):

```
MONGODB_URI=
OPENAI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
TOPIC_TAGGER_MODEL=gpt-4o-mini
```

## Running & Development Notes

- Make sure you run `pnpm install` after pulling changes.
- Keep secrets server-side (do not expose as `NEXT_PUBLIC_*`).
- If you see TypeScript import errors for `next-auth`, run:

```bash
pnpm add next-auth
pnpm add -D @types/next-auth
```

## Key Rotation & Security

- If a key is accidentally exposed, revoke it immediately from the provider dashboard and generate a new key.
- The ChatGPT/OpenAI API key used by this project is rotated/issued monthly in your setup — plan to update the `OPENAI_API_KEY` before month-end to avoid service interruption.

## Project Structure (high level)

- `app/` — Next.js app router pages and API routes
- `components/` — React UI components (chat, analytics, feedback)
- `lib/` — server utilities (db connection, models, OpenAI wrapper, topic tagging)
- `hooks/` — client hooks (chat store)
- `types/` — TypeScript types

## Troubleshooting

- `Cannot find module 'next-auth/react'` — install `next-auth` and types as above.
- `Route used params is a Promise` — Next.js app router requires awaiting dynamic `params` in API routes; see `app/api/*/route.ts` handlers.

## Contributing

- Fork, branch, commit, and open a PR. Keep changes minimal and focused.

## License

MIT

```
