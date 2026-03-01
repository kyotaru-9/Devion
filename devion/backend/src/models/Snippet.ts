export interface CodeSnippet {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  language: string;
  code: string;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSnippetInput {
  title: string;
  description?: string;
  language: string;
  code: string;
  tags?: string[];
  is_public?: boolean;
}

export interface UpdateSnippetInput {
  title?: string;
  description?: string;
  code?: string;
  tags?: string[];
  is_public?: boolean;
}
