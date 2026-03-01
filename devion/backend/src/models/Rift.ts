export interface RiftChallenge {
  id: string;
  title: string;
  description: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string | null;
  starter_code: string | null;
  solution: string | null;
  test_cases: any[];
  points: number;
  time_limit: number | null;
  created_by: string | null;
  created_at: string;
}

export interface RiftProject {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  code: string | null;
  thumbnail_url: string | null;
  is_public: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface RiftChallengeInput {
  title: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  starter_code?: string;
  solution?: string;
  test_cases?: any[];
  points?: number;
  time_limit?: number;
}

export interface CreateProjectInput {
  title: string;
  description?: string;
  code?: string;
  thumbnail_url?: string;
  is_public?: boolean;
}
