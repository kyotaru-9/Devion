export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileInput {
  id: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
}

export interface UpdateProfileInput {
  username?: string;
  avatar_url?: string;
  bio?: string;
}
