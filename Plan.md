# Devion - System Implementation Plan

## Project Overview

**Devion** is a multi-mode programming learning system with web and desktop applications. It combines foundational instruction, interactive practice, real-world application, and secure skill validation through three distinct learning modes: Codex, Rift, and Forge.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend (Web) | React, TypeScript, TailwindCSS |
| Desktop App | Electron (React + TypeScript) |
| Code Editor | Monaco Editor |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Real-time | Supabase Realtime |

---

## Application Architecture

### Desktop App (Electron)

```
┌─────────────────────────────────────────────────────────────┐
│                    Main App / Launcher                       │
│  - Mode Selection UI (Codex, Rift, Forge)                   │
│  - App Launching Logic                                       │
│  - Window Management                                         │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ Codex Mode  │      │ Rift Mode   │      │ Forge Mode  │
│   App       │      │   App       │      │   App       │
└─────────────┘      └─────────────┘      └─────────────┘
```

### Web Application

- Same three modes accessible via browser
- Responsive design for various screen sizes
- Cloud-based progress sync

---

## Desktop App - 4 Parts

### 1. Main App / Launcher

**Responsibilities:**
- Display mode selection screen (Codex, Rift, Forge)
- Handle app navigation and routing
- Manage window state (minimize, maximize, close)
- Check for updates
- User authentication state management

**UI Components:**
- Mode selection cards with icons and descriptions
- User profile dropdown
- Settings access
- Version info

### 2. Codex Mode App

**Features:**
- Learning plan creation and management
- Course catalog browser
- Lesson viewer with markdown content
- Interactive exercises with code input (Monaco Editor)
- Code review interface
- Reference materials library
- Progress tracking
- Discussion forums

**Navigation:**
- Dashboard → Courses → Lessons → Exercises → Review

### 3. Rift Mode App

**Features:**
- Visual programming concept demonstrations
- Interactive coding challenges with time limits
- Gamification elements (points, badges, streaks)
- Project-based learning modules
- Leaderboards
- Community project gallery
- Real-time collaboration on projects

**Navigation:**
- Dashboard → Challenges → Projects → Community

### 4. Forge Mode App

**Features:**
- Challenge browser (LeetCode-style)
- Code editor with test case runner
- Solution submission and saving
- Snippet management
- Leaderboard
- **Sentinel (Coming Soon)** - Custom room assessment system

**Navigation:**
- Dashboard → Challenges → Editor → Submit → Leaderboard

---

## Database Schema (Supabase)

### Tables

```sql
-- Users
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Learning Plans
learning_plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT,
  description TEXT,
  goals JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Courses
courses (
  id UUID PRIMARY KEY,
  title TEXT,
  description TEXT,
  difficulty TEXT,
  category TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN,
  created_at TIMESTAMP
)

-- Modules (within courses)
modules (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  title TEXT,
  description TEXT,
  order_index INTEGER,
  created_at TIMESTAMP
)

-- Lessons
lessons (
  id UUID PRIMARY KEY,
  module_id UUID REFERENCES modules(id),
  title TEXT,
  content TEXT, -- markdown
  order_index INTEGER,
  created_at TIMESTAMP
)

-- Exercises
exercises (
  id UUID PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id),
  title TEXT,
  description TEXT,
  starter_code TEXT,
  solution TEXT,
  test_cases JSONB,
  difficulty TEXT,
  created_at TIMESTAMP
)

-- User Progress
user_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  lesson_id UUID REFERENCES lessons(id),
  exercise_id UUID REFERENCES exercises(id),
  status TEXT, -- 'not_started', 'in_progress', 'completed'
  completed_at TIMESTAMP,
  score INTEGER
)

-- Rift Challenges
challenges (
  id UUID PRIMARY KEY,
  title TEXT,
  description TEXT,
  difficulty TEXT,
  time_limit INTEGER, -- seconds
  points INTEGER,
  category TEXT,
  test_cases JSONB,
  starter_code TEXT,
  solution TEXT,
  created_at TIMESTAMP
)

-- Rift Projects
projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT,
  description TEXT,
  code TEXT,
  is_public BOOLEAN,
  likes_count INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Project Comments
project_comments (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES profiles(id),
  content TEXT,
  created_at TIMESTAMP
)

-- Forge Challenges
forge_challenges (
  id UUID PRIMARY KEY,
  title TEXT,
  description TEXT,
  difficulty TEXT,
  category TEXT,
  test_cases JSONB,
  starter_code TEXT,
  solution TEXT,
  constraints TEXT,
  created_at TIMESTAMP
)

-- User Forge Submissions
forge_submissions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  challenge_id UUID REFERENCES forge_challenges(id),
  code TEXT,
  status TEXT, -- 'pending', 'accepted', 'wrong_answer', 'runtime_error'
  execution_time INTEGER,
  memory_used INTEGER,
  submitted_at TIMESTAMP
)

-- Code Snippets
code_snippets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT,
  language TEXT,
  code TEXT,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP
)

-- Discussion Posts
discussion_posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  lesson_id UUID REFERENCES lessons(id),
  title TEXT,
  content TEXT,
  created_at TIMESTAMP
)

-- Discussion Replies
discussion_replies (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES discussion_posts(id),
  user_id UUID REFERENCES profiles(id),
  content TEXT,
  created_at TIMESTAMP
)

-- Gamification - User Stats
user_stats (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  total_points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]',
  rank INTEGER,
  challenges_completed INTEGER DEFAULT 0,
  updated_at TIMESTAMP
)

-- Badges
badges (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  icon_url TEXT,
  criteria JSONB
)

-- Sentinel Rooms (Coming Soon)
sentinel_rooms (
  id UUID PRIMARY KEY,
  host_id UUID REFERENCES profiles(id),
  name TEXT,
  rules JSONB,
  allowed_tools TEXT[],
  status TEXT, -- 'waiting', 'active', 'completed'
  created_at TIMESTAMP
)

-- Sentinel Participants
sentinel_participants (
  id UUID PRIMARY KEY,
  room_id UUID REFERENCES sentinel_rooms(id),
  user_id UUID REFERENCES profiles(id),
  joined_at TIMESTAMP
)
```

---

## API Endpoints (Express.js)

### Auth
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (admin)
- `PUT /api/courses/:id` - Update course (admin)
- `DELETE /api/courses/:id` - Delete course (admin)

### Lessons
- `GET /api/courses/:courseId/modules/:moduleId/lessons` - List lessons
- `GET /api/lessons/:id` - Get lesson content
- `POST /api/lessons` - Create lesson (admin)

### Exercises
- `GET /api/exercises/:id` - Get exercise
- `POST /api/exercises/:id/submit` - Submit exercise solution
- `GET /api/exercises/:id/test` - Run tests locally

### Rift Challenges
- `GET /api/challenges` - List challenges
- `GET /api/challenges/:id` - Get challenge details
- `POST /api/challenges/:id/submit` - Submit challenge solution
- `GET /api/leaderboard` - Get global leaderboard

### Rift Projects
- `GET /api/projects` - List public projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/like` - Like project
- `POST /api/projects/:id/comments` - Comment on project

### Forge Challenges
- `GET /api/forge/challenges` - List forge challenges
- `GET /api/forge/challenges/:id` - Get challenge
- `POST /api/forge/challenges/:id/submit` - Submit solution

### Snippets
- `GET /api/snippets` - List user snippets
- `POST /api/snippets` - Create snippet
- `PUT /api/snippets/:id` - Update snippet
- `DELETE /api/snippets/:id` - Delete snippet

### Discussions
- `GET /api/lessons/:lessonId/discussions` - List discussions
- `POST /api/lessons/:lessonId/discussions` - Create post
- `POST /api/discussions/:id/replies` - Reply to post

### User Stats
- `GET /api/users/:id/stats` - Get user stats
- `GET /api/users/:id/progress` - Get learning progress

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Set up Electron project with React + TypeScript
- [ ] Configure TailwindCSS
- [ ] Set up Supabase project and database
- [ ] Implement Express.js backend skeleton
- [ ] Create Main App / Launcher UI

### Phase 2: Codex Mode
- [ ] Implement course listing and details
- [ ] Build lesson viewer with markdown rendering
- [ ] Integrate Monaco Editor for code exercises
- [ ] Create exercise submission and validation
- [ ] Implement progress tracking

### Phase 3: Rift Mode
- [ ] Build challenge browser
- [ ] Implement timed challenge system
- [ ] Add gamification (points, badges, streaks)
- [ ] Create project sharing functionality
- [ ] Implement leaderboard

### Phase 4: Forge Mode
- [ ] Build LeetCode-style challenge interface
- [ ] Implement code execution and test runner
- [ ] Create submission history
- [ ] Add snippet management
- [ ] Scaffold Sentinel feature (Coming Soon UI)

### Phase 5: Web Application
- [ ] Create responsive web version
- [ ] Implement authentication flow
- [ ] Sync progress with desktop app
- [ ] Add real-time features (discussions, leaderboard)

### Phase 6: Polish
- [ ] Add offline support
- [ ] Implement auto-updates
- [ ] Performance optimization
- [ ] Bug fixes and testing

---

## Key Features Summary

| Mode | Core Features |
|------|---------------|
| **Launcher** | Mode selection, navigation, auth state |
| **Codex** | Courses, lessons, exercises, code review, discussions |
| **Rift** | Timed challenges, projects, leaderboards, badges |
| **Forge** | Algorithm challenges, test runner, snippets, Sentinel (coming soon) |

---

## File Structure

```
devion/
├── desktop/                    # Electron app
│   ├── src/
│   │   ├── main/              # Electron main process
│   │   ├── renderer/          # React app
│   │   │   ├── components/    # Shared components
│   │   │   ├── pages/         # Page components
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── lib/           # Utilities
│   │   │   └── App.tsx
│   │   └── preload/
│   └── package.json
├── web/                        # Web app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── App.tsx
│   └── package.json
├── server/                     # Express.js API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── index.js
│   └── package.json
└── supabase/
    └── schema.sql             # Database schema
```
