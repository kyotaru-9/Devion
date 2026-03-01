export interface CodexCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CodexModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
}

export interface CodexLesson {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  order_index: number;
  created_at: string;
}

export interface CodexExercise {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  starter_code: string | null;
  solution: string | null;
  test_cases: any[];
  points: number;
  created_at: string;
}

export interface CodexUserProgress {
  id: string;
  user_id: string;
  lesson_id: string | null;
  exercise_id: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCourseInput {
  title: string;
  description?: string;
  thumbnail_url?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours?: number;
  is_published?: boolean;
}

export interface CreateModuleInput {
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
}

export interface CreateLessonInput {
  module_id: string;
  title: string;
  content?: string;
  order_index: number;
}

export interface CreateExerciseInput {
  lesson_id: string;
  title: string;
  description?: string;
  instructions?: string;
  starter_code?: string;
  solution?: string;
  test_cases?: any[];
  points?: number;
}
