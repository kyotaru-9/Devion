# Devion - Multi-Mode Programming Learning System

A comprehensive programming learning platform with web and desktop applications, featuring three distinct learning modes: Codex, Rift, and Forge.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend (Web) | React, TypeScript, TailwindCSS |
| Desktop Apps | Electron (React + TypeScript) - 3 separate apps |
| Code Editor | Monaco Editor |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |

## Project Structure

```
devion/
├── desktop/
│   ├── codex/           # Codex Electron app (port 5173)
│   │   ├── src/
│   │   │   └── pages/Codex.tsx
│   │   ├── electron-main.js
│   │   └── package.json
│   ├── rift/            # Rift Electron app (port 5174)
│   │   ├── src/
│   │   │   └── pages/Rift.tsx
│   │   ├── electron-main.js
│   │   └── package.json
│   └── forge/           # Forge Electron app (port 5175)
│       ├── src/
│       │   └── pages/Forge.tsx
│       ├── electron-main.js
│       └── package.json
├── web/                 # Web application (all modes in one)
│   ├── src/
│   │   └── pages/       # Launcher, Codex, Rift, Forge
│   └── package.json
├── server/              # Express.js API
│   └── src/index.js
└── supabase/
    └── schema.sql
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and execute the contents of `supabase/schema.sql`
4. Get your project URL and anon key from Project Settings > API

### 2. Setup Desktop Apps (Each runs as separate Electron app)

**Codex:**
```bash
cd devion/desktop/codex
npm install
npm run dev
```

**Rift:**
```bash
cd devion/desktop/rift
npm install
npm run dev
```

**Forge:**
```bash
cd devion/desktop/forge
npm install
npm run dev
```

### 3. Setup Web App

```bash
cd devion/web
npm install
npm run dev
```

### 4. Setup Backend Server

```bash
cd devion/server
npm install
# Create .env file with:
# SUPABASE_URL=your-supabase-url
# SUPABASE_ANON_KEY=your-anon-key
npm run dev
```

## Learning Modes

### Codex
Learn programming fundamentals with structured courses, lessons, and interactive exercises.

### Rift
Challenge yourself with timed coding challenges, earn points, build streaks, and share projects with the community.

### Forge
Master algorithms with LeetCode-style challenges, track submissions, and manage code snippets.

## API Endpoints

- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/courses` - List courses
- `GET /api/challenges` - List Rift challenges
- `GET /api/forge/challenges` - List Forge challenges
- `POST /api/projects` - Create project
- And more...

## License

MIT
