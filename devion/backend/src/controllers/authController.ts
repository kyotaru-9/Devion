import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const authController = {
  async signup(req: Request, res: Response) {
    try {
      const { email, password, username } = req.body;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async logout(req: Request, res: Response) {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async me(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) throw new Error('No token provided');
      
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error) throw error;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      res.json({ user, profile });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
};
