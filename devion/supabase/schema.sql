-- Devion Database Schema for Supabase

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
CREATE TABLE public.courses (
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
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LESSONS (belongs to module)
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXERCISES (belongs to lesson)
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
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
CREATE TABLE public.challenges (
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
CREATE TABLE public.projects (
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

-- USER PROGRESS
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
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
CREATE INDEX idx_modules_course ON public.modules(course_id);
CREATE INDEX idx_lessons_module ON public.lessons(module_id);
CREATE INDEX idx_exercises_lesson ON public.exercises(lesson_id);
CREATE INDEX idx_challenges_difficulty ON public.challenges(difficulty);
CREATE INDEX idx_projects_user ON public.projects(user_id);
CREATE INDEX idx_forge_challenges_difficulty ON public.forge_challenges(difficulty);
CREATE INDEX idx_forge_submissions_user ON public.forge_submissions(user_id);
CREATE INDEX idx_forge_submissions_challenge ON public.forge_submissions(challenge_id);
CREATE INDEX idx_code_snippets_user ON public.code_snippets(user_id);
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_sentinel_participants_room ON public.sentinel_participants(room_id);

-- RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forge_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentinel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentinel_participants ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Courses policies
CREATE POLICY "Published courses are viewable by everyone" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Users can insert own courses" ON public.courses FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own courses" ON public.courses FOR UPDATE USING (auth.uid() = created_by);

-- Modules, Lessons, Exercises - viewable if course is published
CREATE POLICY "Modules viewable if course published" ON public.modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND is_published = true)
);

CREATE POLICY "Lessons viewable if course published" ON public.lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.modules m JOIN public.courses c ON m.course_id = c.id WHERE m.id = module_id AND c.is_published = true)
);

CREATE POLICY "Exercises viewable if course published" ON public.exercises FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.lessons l JOIN public.modules m ON l.module_id = m.id JOIN public.courses c ON m.course_id = c.id WHERE l.id = lesson_id AND c.is_published = true)
);

-- Challenges (Rift) policies
CREATE POLICY "Challenges are viewable by everyone" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Users can insert challenges" ON public.challenges FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Projects policies
CREATE POLICY "Public projects viewable by everyone" ON public.projects FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);

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

-- User progress policies
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

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
  UPDATE public.projects
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
