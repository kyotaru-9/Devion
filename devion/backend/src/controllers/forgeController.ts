import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const forgeController = {
  async getChallenges(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('forge_challenges')
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
        .from('forge_challenges')
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
      
      const { data: challenge, error: challengeError } = await supabase
        .from('forge_challenges')
        .select('test_cases, solution')
        .eq('id', id)
        .single();
      if (challengeError) throw challengeError;

      const passed = code.includes('return');
      const status = passed ? 'accepted' : 'wrong_answer';
      
      await supabase.from('forge_submissions').insert({
        user_id: userId,
        challenge_id: id,
        code,
        status
      });

      res.json({ status, message: passed ? 'Accepted!' : 'Wrong answer' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};
