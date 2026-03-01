import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const codexController = {
  async getCourses(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('codex_courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { data: course, error: courseError } = await supabase
        .from('codex_courses')
        .select('*')
        .eq('id', id)
        .single();
      if (courseError) throw courseError;

      const { data: modules } = await supabase
        .from('codex_modules')
        .select('*')
        .eq('course_id', id)
        .order('order_index');

      res.json({ ...course, modules });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getModules(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const { data, error } = await supabase
        .from('codex_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getLessons(req: Request, res: Response) {
    try {
      const { moduleId } = req.params;
      const { data, error } = await supabase
        .from('codex_lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index');
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getLesson(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('codex_lessons')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getExercise(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('codex_exercises')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async submitExercise(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { code, userId } = req.body;
      
      const { data: exercise, error: exerciseError } = await supabase
        .from('codex_exercises')
        .select('solution, test_cases')
        .eq('id', id)
        .single();
      if (exerciseError) throw exerciseError;

      const passed = code.trim().length > 0;
      
      if (passed) {
        await supabase.from('codex_user_progress').upsert({
          user_id: userId,
          exercise_id: id,
          status: 'completed',
          completed_at: new Date().toISOString(),
          score: 100
        });
      }
      
      res.json({ passed, message: passed ? 'Correct!' : 'Try again' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getUserProgress(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('codex_user_progress')
        .select('*, codex_lessons(title), codex_exercises(title)')
        .eq('user_id', id);
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};
