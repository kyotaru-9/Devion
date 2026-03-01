export interface ForgeChallenge {
  id: string;
  title: string;
  description: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string | null;
  starter_code: string | null;
  solution: string | null;
  test_cases: any[];
  constraints: string | null;
  examples: any[];
  points: number;
  created_by: string | null;
  created_at: string;
}

export interface ForgeSubmission {
  id: string;
  user_id: string;
  challenge_id: string;
  code: string;
  status: 'pending' | 'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error';
  execution_time: number | null;
  memory_used: number | null;
  created_at: string;
}

export interface ForgeChallengeInput {
  title: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  starter_code?: string;
  solution?: string;
  test_cases?: any[];
  constraints?: string;
  examples?: any[];
  points?: number;
}

export interface CreateSubmissionInput {
  challenge_id: string;
  code: string;
  status: 'pending' | 'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error';
  execution_time?: number;
  memory_used?: number;
}
