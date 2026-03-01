-- Drop all Devion tables if they exist
DROP TABLE IF EXISTS public.forge_submissions CASCADE;
DROP TABLE IF EXISTS public.forge_challenges CASCADE;
DROP TABLE IF EXISTS public.code_snippets CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.challenges CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.modules CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.user_stats CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.sentinel_participants CASCADE;
DROP TABLE IF EXISTS public.sentinel_rooms CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS public.increment_user_points(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.increment_project_likes(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_profile_created() CASCADE;

-- Drop view if it exists
DROP VIEW IF EXISTS public.leaderboard CASCADE;
