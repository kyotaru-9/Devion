import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const snippetController = {
  async getSnippets(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { data, error } = await supabase
        .from('code_snippets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async createSnippet(req: Request, res: Response) {
    try {
      const { title, language, code, description, tags, userId } = req.body;
      const { data, error } = await supabase
        .from('code_snippets')
        .insert({
          user_id: userId,
          title,
          language,
          code,
          description,
          tags
        })
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateSnippet(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, code, tags, is_public } = req.body;
      const { data, error } = await supabase
        .from('code_snippets')
        .update({
          title,
          description,
          code,
          tags,
          is_public,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteSnippet(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('code_snippets')
        .delete()
        .eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};
