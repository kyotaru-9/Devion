import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const riftController = {
  async getChallenges(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('rift_challenges')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getChallenge(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('rift_challenges')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async submitChallenge(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { code, userId } = req.body;
      
      const { data: challenge } = await supabase
        .from('rift_challenges')
        .select('points')
        .eq('id', id)
        .single();

      await supabase.rpc('increment_user_points', { 
        user_id: userId, 
        points: challenge?.points || 0 
      });

      res.json({ success: true, points: challenge?.points || 0 });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getProjects(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('rift_projects')
        .select('*, profiles(username, avatar_url)')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async createProject(req: Request, res: Response) {
    try {
      const { title, description, code, isPublic, userId } = req.body;
      const { data, error } = await supabase
        .from('rift_projects')
        .insert({
          user_id: userId,
          title,
          description,
          code,
          is_public: isPublic
        })
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async likeProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .rpc('increment_project_likes', { project_id: id });
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};
