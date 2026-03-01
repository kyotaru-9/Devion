-- Complete Devion Database Setup Script
-- Run this entire script in Supabase SQL Editor

-- First, drop all existing tables and functions
DROP TABLE IF EXISTS public.forge_submissions CASCADE;
DROP TABLE IF EXISTS public.forge_challenges CASCADE;
DROP TABLE IF EXISTS public.code_snippets CASCADE;
DROP TABLE IF EXISTS public.rift_projects CASCADE;
DROP TABLE IF EXISTS public.rift_challenges CASCADE;
DROP TABLE IF EXISTS public.codex_user_progress CASCADE;
DROP TABLE IF EXISTS public.codex_exercises CASCADE;
DROP TABLE IF EXISTS public.codex_lessons CASCADE;
DROP TABLE IF EXISTS public.codex_modules CASCADE;
DROP TABLE IF EXISTS public.codex_courses CASCADE;
DROP TABLE IF EXISTS public.user_stats CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.sentinel_participants CASCADE;
DROP TABLE IF EXISTS public.sentinel_rooms CASCADE;

DROP FUNCTION IF EXISTS public.increment_user_points(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.increment_project_likes(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_profile_created() CASCADE;

DROP VIEW IF EXISTS public.leaderboard CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- COURSES (Codex Mode)
CREATE TABLE public.codex_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_hours INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MODULES (belongs to course)
CREATE TABLE public.codex_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.codex_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LESSONS (belongs to module)
CREATE TABLE public.codex_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES public.codex_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXERCISES (belongs to lesson)
CREATE TABLE public.codex_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES public.codex_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  starter_code TEXT,
  solution TEXT,
  test_cases JSONB DEFAULT '[]'::jsonb,
  points INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHALLENGES (Rift Mode - gamified challenges)
CREATE TABLE public.rift_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT,
  starter_code TEXT,
  solution TEXT,
  test_cases JSONB DEFAULT '[]'::jsonb,
  points INTEGER DEFAULT 50,
  time_limit INTEGER,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS (Rift Mode - user projects)
CREATE TABLE public.rift_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FORGE CHALLENGES (Forge Mode - LeetCode style)
CREATE TABLE public.forge_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT,
  starter_code TEXT,
  solution TEXT,
  test_cases JSONB DEFAULT '[]'::jsonb,
  constraints TEXT,
  examples JSONB DEFAULT '[]'::jsonb,
  points INTEGER DEFAULT 100,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FORGE SUBMISSIONS
CREATE TABLE public.forge_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.forge_challenges(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'wrong_answer', 'time_limit', 'runtime_error')),
  execution_time INTEGER,
  memory_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CODE SNIPPETS (user saved code)
CREATE TABLE public.code_snippets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER STATS
CREATE TABLE public.user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  challenges_completed INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER PROGRESS (Codex Mode - user-specific)
CREATE TABLE public.codex_user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.codex_lessons(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.codex_exercises(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')),
  score INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id, exercise_id)
);

-- SENTINEL ASSESSMENTS (Forge Mode - proctored assessments)
CREATE TABLE public.sentinel_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  challenge_ids UUID[] DEFAULT '{}',
  allowed_tools TEXT[] DEFAULT '{devion-ide}',
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.sentinel_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES public.sentinel_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('waiting', 'active', 'completed', 'disqualified')),
  score INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- INDEXES
CREATE INDEX idx_codex_modules_course ON public.codex_modules(course_id);
CREATE INDEX idx_codex_lessons_module ON public.codex_lessons(module_id);
CREATE INDEX idx_codex_exercises_lesson ON public.codex_exercises(lesson_id);
CREATE INDEX idx_rift_challenges_difficulty ON public.rift_challenges(difficulty);
CREATE INDEX idx_rift_projects_user ON public.rift_projects(user_id);
CREATE INDEX idx_forge_challenges_difficulty ON public.forge_challenges(difficulty);
CREATE INDEX idx_forge_submissions_user ON public.forge_submissions(user_id);
CREATE INDEX idx_forge_submissions_challenge ON public.forge_submissions(challenge_id);
CREATE INDEX idx_code_snippets_user ON public.code_snippets(user_id);
CREATE INDEX idx_codex_user_progress_user ON public.codex_user_progress(user_id);
CREATE INDEX idx_sentinel_participants_room ON public.sentinel_participants(room_id);

-- RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codex_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codex_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codex_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codex_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codex_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rift_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rift_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forge_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentinel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentinel_participants ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Codex Courses policies
CREATE POLICY "Published codex courses are viewable by everyone" ON public.codex_courses FOR SELECT USING (is_published = true);
CREATE POLICY "Users can insert own codex courses" ON public.codex_courses FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own codex courses" ON public.codex_courses FOR UPDATE USING (auth.uid() = created_by);

-- Codex Modules, Lessons, Exercises - viewable if course is published
CREATE POLICY "Codex modules viewable if course published" ON public.codex_modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.codex_courses WHERE id = course_id AND is_published = true)
);

CREATE POLICY "Codex lessons viewable if course published" ON public.codex_lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.codex_modules m JOIN public.codex_courses c ON m.course_id = c.id WHERE m.id = module_id AND c.is_published = true)
);

CREATE POLICY "Codex exercises viewable if course published" ON public.codex_exercises FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.codex_lessons l JOIN public.codex_modules m ON l.module_id = m.id JOIN public.codex_courses c ON m.course_id = c.id WHERE l.id = lesson_id AND c.is_published = true)
);

-- Codex User Progress policies
CREATE POLICY "Users can view own codex progress" ON public.codex_user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own codex progress" ON public.codex_user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own codex progress" ON public.codex_user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Rift Challenges policies
CREATE POLICY "Rift challenges are viewable by everyone" ON public.rift_challenges FOR SELECT USING (true);
CREATE POLICY "Users can insert rift challenges" ON public.rift_challenges FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Rift Projects policies
CREATE POLICY "Public rift projects viewable by everyone" ON public.rift_projects FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own rift projects" ON public.rift_projects FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own rift projects" ON public.rift_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rift projects" ON public.rift_projects FOR UPDATE USING (auth.uid() = user_id);

-- Forge challenges policies
CREATE POLICY "Forge challenges viewable by everyone" ON public.forge_challenges FOR SELECT USING (true);
CREATE POLICY "Users can insert forge challenges" ON public.forge_challenges FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Forge submissions policies
CREATE POLICY "Users can view own submissions" ON public.forge_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions" ON public.forge_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Code snippets policies
CREATE POLICY "Public snippets viewable by everyone" ON public.code_snippets FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own snippets" ON public.code_snippets FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own snippets" ON public.code_snippets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own snippets" ON public.code_snippets FOR UPDATE USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);

-- FUNCTIONS

-- Increment user points
CREATE OR REPLACE FUNCTION public.increment_user_points(user_id UUID, points INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, total_points, challenges_completed)
  VALUES (user_id, points, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_stats.total_points + points,
    challenges_completed = user_stats.challenges_completed + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Increment project likes
CREATE OR REPLACE FUNCTION public.increment_project_likes(project_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.rift_projects
  SET likes_count = likes_count + 1
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- Get user leaderboard with profile
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  us.user_id,
  p.username,
  p.avatar_url,
  us.total_points,
  us.challenges_completed,
  us.current_streak
FROM public.user_stats us
JOIN public.profiles p ON us.user_id = p.id
ORDER BY us.total_points DESC;

-- Insert default user stats on profile creation
CREATE OR REPLACE FUNCTION public.handle_profile_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_created();

-- ============================================
-- PERMISSIONS (grant access to anon role)
-- ============================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.codex_courses TO anon;
GRANT SELECT ON public.codex_modules TO anon;
GRANT SELECT ON public.codex_lessons TO anon;
GRANT SELECT ON public.codex_exercises TO anon;
GRANT SELECT ON public.codex_user_progress TO anon;
GRANT SELECT ON public.rift_challenges TO anon;
GRANT SELECT ON public.rift_projects TO anon;
GRANT SELECT ON public.forge_challenges TO anon;
GRANT SELECT ON public.forge_submissions TO anon;
GRANT SELECT ON public.code_snippets TO anon;
GRANT SELECT ON public.user_stats TO anon;
GRANT SELECT ON public.sentinel_rooms TO anon;
GRANT SELECT ON public.sentinel_participants TO anon;

-- Also grant insert/update for user-specific tables
GRANT INSERT, UPDATE ON public.codex_user_progress TO anon;
GRANT INSERT, UPDATE ON public.user_stats TO anon;

-- ============================================
-- SAMPLE DATA (Available to all users)
-- Note: Each user has their own progress/stats in codex_user_progress and user_stats tables
-- ============================================

-- Sample Codex Courses (Global content - same for all users)
INSERT INTO public.codex_courses (id, title, description, difficulty, estimated_hours, is_published, created_at) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'JavaScript Fundamentals', 'Learn the basics of JavaScript programming', 'beginner', 12, true, NOW()),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'React Essentials', 'Master React components, hooks, and state management', 'intermediate', 18, true, NOW()),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'TypeScript Mastery', 'Advanced TypeScript patterns and type safety', 'advanced', 15, true, NOW()),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Python for Beginners', 'Start your programming journey with Python', 'beginner', 10, true, NOW()),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Node.js Backend', 'Build server-side applications with Node.js', 'intermediate', 20, true, NOW());

-- Sample Codex Modules for JavaScript Course
INSERT INTO public.codex_modules (id, course_id, title, description, order_index, created_at) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Getting Started', 'Introduction to JavaScript', 1, NOW()),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Variables & Data Types', 'Learn about variables', 2, NOW()),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Functions', 'Creating and using functions', 3, NOW()),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'DOM Manipulation', 'Interacting with HTML', 4, NOW());

-- Sample Codex Modules for React Course
INSERT INTO public.codex_modules (id, course_id, title, description, order_index, created_at) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'React Basics', 'Introduction to React', 1, NOW()),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Components', 'Creating components', 2, NOW()),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'State & Props', 'Managing data', 3, NOW()),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Hooks', 'useState and useEffect', 4, NOW());

-- Sample Codex Modules for TypeScript Course
INSERT INTO public.codex_modules (id, course_id, title, description, order_index, created_at) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'TypeScript Basics', 'Types and interfaces', 1, NOW()),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Advanced Types', 'Union and intersection', 2, NOW()),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Generics', 'Generic functions', 3, NOW());

-- Sample Codex Lessons for JavaScript - Getting Started
INSERT INTO public.codex_lessons (id, module_id, title, content, order_index, created_at) VALUES
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'What is JavaScript?', '# What is JavaScript?

JavaScript is a versatile programming language that powers the interactive web. Originally created in 1995, it has evolved from a simple scripting language to a full-fledged programming language that can be used for:

- **Web Development** - Creating interactive websites and web applications
- **Server-Side Development** - Building backend services with Node.js
- **Mobile Apps** - Developing cross-platform mobile applications
- **Game Development** - Creating browser-based games

## Why Learn JavaScript?

1. **Universal Language** - It runs in every web browser
2. **High Demand** - One of the most sought-after skills in tech
3. **Versatility** - Use it for frontend, backend, and mobile
4. **Community** - Massive ecosystem of libraries and frameworks

## Your First JavaScript

Open your browser console and type:

```javascript
console.log("Hello, World!");
```

Congratulations! You have just written your first JavaScript code.', 1, NOW()),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a52', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Setting Up', '# Setting Up Your Development Environment

Before you start coding, you need to set up your development environment.

## Option 1: Browser Console

The easiest way to start is using your browser''s built-in developer console:

1. Open Chrome or Firefox
2. Press F12 or right-click → Inspect
3. Click on the "Console" tab

## Option 2: Code Playground

Use online editors like:
- **CodePen** - codepen.io
- **JSFiddle** - jsfiddle.net
- **Replit** - replit.com

## Option 3: Local Development

For a professional setup:

1. **Install VS Code** - code.visualstudio.com
2. **Install Node.js** - nodejs.org
3. **Create a project folder**
4. **Create an index.html file**

```html
<!DOCTYPE html>
<html>
<head>
  <title>My First App</title>
</head>
<body>
  <script src="app.js"></script>
</body>
</html>
```

5. **Create app.js** - Write your JavaScript here

You are now ready to start coding!', 2, NOW()),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a53', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'First Code', '# Your First JavaScript Code

Let''s write your first meaningful JavaScript program!

## The console.log() Function

The most fundamental way to output data in JavaScript is using `console.log()`:

```javascript
console.log("Hello, World!");
console.log(42);
console.log(true);
```

## Variables

Variables store data that you can use later:

```javascript
// Using let (recommended for variables that change)
let message = "Hello!";
console.log(message);

// Using const (for values that won''t change)
const PI = 3.14159;
```

## Basic Operations

```javascript
// Arithmetic
let sum = 5 + 3;      // 8
let product = 4 * 2;  // 8
let quotient = 10 / 2; // 5

// String concatenation
let greeting = "Hello, " + "World!";

// Template literals (modern way)
let name = "Developer";
let welcome = `Hello, ${name}!`;
```

## Try It Yourself

1. Open your console
2. Create a variable with your name
3. Print a greeting using your name
4. Calculate your age in days (age * 365)

You have taken your first steps into JavaScript programming!', 3, NOW());

-- Sample Codex Lessons for JavaScript - Variables
INSERT INTO public.codex_lessons (id, module_id, title, content, order_index, created_at) VALUES
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a61', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Variables', '# Variables in JavaScript

Variables are containers for storing data values. In JavaScript, we have three ways to declare variables:

## let - Block Scoped Variables

`let` is the modern way to declare variables that may change:

```javascript
let age = 25;
age = 26; // Reassignment is allowed

// Block scoped - only exists within {}
if (true) {
  let message = "Hello";
}
console.log(message); // Error!
```

## const - Constants

Use `const` for values that should not change:

```javascript
const PI = 3.14159;
const API_URL = "https://api.example.com";

// Cannot reassign - this will error:
// PI = 3.14; // TypeError!
```

## var - Legacy Variables

`var` is the old way (avoid in modern code):

```javascript
var oldStyle = "Don''t use this";
```

## Best Practices

1. **Use const by default** - Only use let when you need to reassign
2. **Use descriptive names** - `userAge` not `x` or `ua`
3. **Use camelCase** - `firstName`, `lastName`
4. **Declare before use** - Better for readability

```javascript
// Good examples
const maxScore = 100;
let currentScore = 0;
let playerName = "Alice";
```

You now understand how to store and manage data in JavaScript!', 1, NOW()),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a62', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Data Types', '# JavaScript Data Types

JavaScript has several built-in data types that you need to understand.

## Primitive Types

### 1. String
Text data enclosed in quotes:

```javascript
let name = "John";
let greeting = ''Hello'';
let template = `My name is ${name}`;
```

### 2. Number
Both integers and decimals:

```javascript
let age = 25;
let price = 19.99;
let negative = -10;
```

### 3. Boolean
True or false values:

```javascript
let isActive = true;
let isComplete = false;
```

### 4. Undefined
Variable declared but not assigned:

```javascript
let unknown;
console.log(unknown); // undefined
```

### 5. Null
Intentional absence of value:

```javascript
let empty = null;
```

## Checking Types

Use `typeof` to check the type:

```javascript
typeof "hello"    // "string"
typeof 42         // "number"
typeof true       // "boolean"
typeof undefined  // "undefined"
typeof null       // "object" (quirk!)
```

## Type Coercion

JavaScript automatically converts types in some cases:

```javascript
"5" + 3   // "53" (string)
"5" - 3   // 2 (number)
Boolean(1) // true
Boolean(0) // false
```

Understanding types is crucial for writing bug-free code!', 2, NOW());

-- Sample Codex Lessons for React - React Basics
INSERT INTO public.codex_lessons (id, module_id, title, content, order_index, created_at) VALUES
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a71', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'Introduction to JSX', '# Introduction to JSX

JSX is a syntax extension for JavaScript that lets you write HTML-like code in JavaScript.

## What is JSX?

JSX looks like HTML but is actually JavaScript:

```jsx
const element = <h1>Hello, World!</h1>;
```

## Why JSX?

- **Declarative** - Describe what the UI should look like
- **Readable** - HTML-like syntax is easy to understand
- **Integrated** - Mix JavaScript logic with UI markup

## JSX vs HTML

JSX is similar to HTML with some differences:

```jsx
// className instead of class
<div className="container">

// camelCase for attributes
<button onClick={handleClick}>
<img src={imageUrl} alt="Description">

// Self-closing tags must close
<input type="text" />
<br />
```

## Embedding JavaScript

Use curly braces {} to embed JavaScript expressions:

```jsx
const name = "Alice";
const element = <h1>Hello, {name}!</h1>;

const sum = <p>2 + 2 = {2 + 2}</p>;

function formatName(user) {
  return user.firstName + " " + user.lastName;
}

const element = <p>{formatName(user)}</p>;
```

JSX is the foundation of React - master it and you are halfway there!', 1, NOW()),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a72', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'First Component', '# Creating Your First React Component

Components are the building blocks of React applications. Let''s create one!

## What is a Component?

A component is a reusable piece of UI that can accept inputs (props) and return React elements.

## Function Components

The modern way to create components:

```jsx
function Welcome() {
  return <h1>Hello, World!</h1>;
}
```

## Using Components

Use components like HTML tags:

```jsx
function App() {
  return (
    <div>
      <Welcome />
      <Welcome />
      <Welcome />
    </div>
  );
}
```

## Components with Props

Pass data to components using props:

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

function App() {
  return (
    <div>
      <Welcome name="Alice" />
      <Welcome name="Bob" />
      <Welcome name="Charlie" />
    </div>
  );
}
```

## Multiple Components

Compose complex UIs from simple components:

```jsx
function Header() {
  return <header><h1>My App</h1></header>;
}

function Main() {
  return <main><p>Welcome to my app!</p></main>;
}

function Footer() {
  return <footer><p>© 2024 My App</p></footer>;
}

function App() {
  return (
    <div>
      <Header />
      <Main />
      <Footer />
    </div>
  );
}
```

You have created your first React components!', 2, NOW());

-- Sample Codex Exercises
INSERT INTO public.codex_exercises (id, lesson_id, title, description, instructions, starter_code, solution, points, created_at) VALUES
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a81', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51', 'Hello World', 'Print to console', 'Use console.log()', '// Your code', 'console.log("Hello");', 10, NOW()),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a82', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a52', 'Variable', 'Create a variable', 'Use let', '// Your code', 'let x = 1;', 10, NOW()),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a83', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a61', 'Constant', 'Create a constant', 'Use const', '// Your code', 'const PI = 3.14;', 10, NOW()),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a84', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a71', 'JSX', 'Return JSX', 'Return JSX', '// Your code', 'return <div>Hi</div>;', 15, NOW());

-- Sample Rift Challenges (Global for all users)
INSERT INTO public.rift_challenges (id, title, description, difficulty, category, starter_code, solution, points, created_at) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a91', 'Two Sum', 'Return indices', 'easy', 'Arrays', 'function twoSum(nums, target) {\n  // Your code\n}', 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}', 50, NOW()),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a92', 'Palindrome', 'Check palindrome', 'easy', 'Strings', 'function isPalindrome(s) {\n  // Your code\n}', 'function isPalindrome(s) {\n  return s === s.split("").reverse().join("");\n}', 50, NOW()),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a93', 'FizzBuzz', 'FizzBuzz', 'easy', 'Logic', 'function fizzBuzz(n) {\n  // Your code\n}', 'function fizzBuzz(n) {\n  const r = [];\n  for (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) r.push("FizzBuzz");\n    else if (i % 3 === 0) r.push("Fizz");\n    else if (i % 5 === 0) r.push("Buzz");\n    else r.push(i);\n  }\n  return r;\n}', 50, NOW()),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a94', 'Reverse List', 'Reverse list', 'medium', 'Linked Lists', 'function reverseList(head) {\n  // Your code\n}', 'function reverseList(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}', 75, NOW()),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a95', 'Binary Search', 'Find target', 'medium', 'Algorithms', 'function binarySearch(arr, target) {\n  // Your code\n}', 'function binarySearch(arr, target) {\n  let l = 0, r = arr.length - 1;\n  while (l <= r) {\n    const m = Math.floor((l + r) / 2);\n    if (arr[m] === target) return m;\n    if (arr[m] < target) l = m + 1;\n    else r = m - 1;\n  }\n  return -1;\n}', 75, NOW()),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a96', 'Merge Intervals', 'Merge intervals', 'hard', 'Algorithms', 'function merge(intervals) {\n  // Your code\n}', 'function merge(intervals) {\n  if (intervals.length <= 1) return intervals;\n  intervals.sort((a, b) => a[0] - b[0]);\n  const res = [intervals[0]];\n  for (let i = 1; i < intervals.length; i++) {\n    if (res[res.length - 1][1] >= intervals[i][0]) {\n      res[res.length - 1][1] = Math.max(res[res.length - 1][1], intervals[i][1]);\n    } else {\n      res.push(intervals[i]);\n    }\n  }\n  return res;\n}', 100, NOW());

-- Sample Forge Challenges (LeetCode style - Global for all users)
INSERT INTO public.forge_challenges (id, title, description, difficulty, category, starter_code, solution, constraints, examples, points, created_at) VALUES
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Valid Parentheses', 'Check valid parentheses', 'medium', 'Stack', 'function isValid(s) {\n  // Your code\n}', 'function isValid(s) {\n  const stack = [];\n  const map = { ")": "(", "}": "{", "]": "[" };\n  for (const char of s) {\n    if (char in map) {\n      if (stack.pop() !== map[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}', '1 <= s.length <= 10^4', '[{"input": "()", "output": "true"}]'::jsonb, 100, NOW()),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Maximum Subarray', 'Largest sum', 'medium', 'Dynamic Programming', 'function maxSubArray(nums) {\n  // Your code\n}', 'function maxSubArray(nums) {\n  let maxSum = nums[0], curSum = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    curSum = Math.max(nums[i], curSum + nums[i]);\n    maxSum = Math.max(maxSum, curSum);\n  }\n  return maxSum;\n}', '1 <= nums.length <= 10^5', '[{"input": "[-2,1,-3,4,-1,2,1,-5,4]", "output": "6"}]'::jsonb, 100, NOW());
