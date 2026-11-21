# Scheduly

Scheduly is a study planner built with Next.js. It includes local email/password accounts, a learning calendar for planned and completed sessions, and server-side study-plan generation with Groq.

## Requirements

- Node.js 22.13 or newer (for the built-in `node:sqlite` module)
- A Groq API key to generate study plans

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The database is created at `data/scheduly.sqlite`. To store it elsewhere, set `SCHEDULY_DB_PATH` to an absolute database file path before starting the app.

Create an account or sign in to use the planner. Passwords are stored as scrypt hashes, sessions use HTTP-only cookies, and each account's subjects, plans, notes, preferences, and Groq key are isolated in the local SQLite database. The first account receives existing planner data from the database.

Configure `GROQ_API_KEY` in `.env.local` (copy `.env.example` to `.env.local` and set the key), or add the key in Settings. The environment variable is used before the per-user Settings key. Mark sessions complete on the Learning Calendar to track your progress.
