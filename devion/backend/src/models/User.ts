export interface UserStats {
  id: string;
  user_id: string;
  total_points: number;
  challenges_completed: number;
  exercises_completed: number;
  current_streak: number;
  longest_streak: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  total_points: number;
  challenges_completed: number;
  current_streak: number;
}

export interface UpdateStatsInput {
  total_points?: number;
  challenges_completed?: number;
  exercises_completed?: number;
  current_streak?: number;
  longest_streak?: number;
  last_activity_at?: string;
}
