import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const userController = {
  async getStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', id)
        .maybeSingle();
      if (error) throw error;
      res.json(data || { user_id: id, total_points: 0, challenges_completed: 0, exercises_completed: 0 });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getLeaderboard(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*, profiles(username, avatar_url)')
        .order('total_points', { ascending: false })
        .limit(10);
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const { data, error } = await supabase
        .from('user_stats')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', id)
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};
