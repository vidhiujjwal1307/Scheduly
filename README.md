# Scheduly

**A smarter way to plan your studies.**

Scheduly is an AI-powered study planner that helps students organise subjects, prepare for exams, and turn study goals into a structured timetable. Add your subjects and exam details, set your study preferences, and generate a personalised study plan with Groq.

## Features

- **AI-generated study plans** — create day-wise study sessions based on subjects, exam dates, priorities, topics, and study preferences.
- **Subject management** — organise subjects, exam dates, priorities, topics, and colour labels.
- **Timetable & learning calendar** — view planned sessions by date and track completed sessions.
- **Notes** — keep study notes alongside your plans.
- **Personal preferences** — set daily study hours, preferred start time, and break duration.
- **Account-based data** — sign up and sign in with email and password; each account's planner data is stored separately.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Next.js Route Handlers
- **Database:** SQLite (`node:sqlite`)
- **AI:** Groq API — `openai/gpt-oss-20b`
- **Utilities & UI:** date-fns, Lucide React, react-hot-toast

## Getting Started

### Prerequisites

- Node.js **22.13.0 or newer**
- npm
- A [Groq API key](https://console.groq.com/keys) for AI study-plan generation

### 1. Clone the repository

```bash
git clone https://github.com/vidhiujjwal1307/Scheduly.git
cd Scheduly
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Add your Groq API key to `.env.local`:

```env
GROQ_API_KEY=your_groq_api_key
```

Groq API keys are configured through the server environment only. Do not enter or store the key in Settings.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the production application |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Data & Security

Scheduly creates its SQLite database at `data/scheduly.sqlite` by default. To use a different location, set `SCHEDULY_DB_PATH` to an absolute database-file path before starting the app.

Passwords are stored as **scrypt hashes**. Session tokens are stored as SHA-256 hashes, while the browser receives an HTTP-only session cookie. Subjects, study plans, notes, and preferences are stored per account in the local SQLite database.

## How Study-Plan Generation Works

1. Add your subjects, exam dates, priorities, and topics.
2. Set your daily study hours, preferred start time, and break duration.
3. Request a study plan from the Generate page.
4. Scheduly sends the relevant details to the Groq API and parses the returned session data.
5. The generated plan is saved to your account and can be viewed in the timetable and learning calendar.
6. Mark sessions as complete to track your progress.

## Contributing

Suggestions, bug reports, and pull requests are welcome. For substantial changes, please open an issue first to discuss what you would like to change.

## License

No license is currently specified for this repository.
