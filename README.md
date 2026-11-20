# Scheduly

Scheduly is a study planner built with Next.js. Subjects, study plans, notes, and settings are stored in a local SQLite database. Study-plan generation runs on the server and uses the Groq API.

## Requirements

- Node.js 22.13 or newer (for the built-in `node:sqlite` module)
- A Groq API key to generate study plans

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The database is created at `data/scheduly.sqlite`. To store it elsewhere, set `SCHEDULY_DB_PATH` to an absolute database file path before starting the app.

Add your Groq API key in Settings. It is saved in the local database and only sent to Groq when generating a study plan.
