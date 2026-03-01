import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import codexRoutes from './routes/codexRoutes.js';
import riftRoutes from './routes/riftRoutes.js';
import forgeRoutes from './routes/forgeRoutes.js';
import snippetRoutes from './routes/snippetRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/codex', codexRoutes);
app.use('/api/rift', riftRoutes);
app.use('/api/forge', forgeRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/users', userRoutes);

app.get('/api/courses', async (req, res) => {
  const { codexController } = await import('./controllers/codexController.js');
  codexController.getCourses(req, res);
});

app.get('/api/courses/:id', async (req, res) => {
  const { codexController } = await import('./controllers/codexController.js');
  codexController.getCourse(req, res);
});

app.get('/api/lessons/:id', async (req, res) => {
  const { codexController } = await import('./controllers/codexController.js');
  codexController.getLesson(req, res);
});

app.get('/api/courses/:courseId/modules/:moduleId/lessons', async (req, res) => {
  const { codexController } = await import('./controllers/codexController.js');
  codexController.getLessons(req, res);
});

app.get('/api/courses/:courseId/modules/:moduleId/lessons/:lessonId', async (req, res) => {
  const { codexController } = await import('./controllers/codexController.js');
  codexController.getLesson(req, res);
});

app.get('/api/exercises/:id', async (req, res) => {
  const { codexController } = await import('./controllers/codexController.js');
  codexController.getExercise(req, res);
});

app.post('/api/exercises/:id/submit', async (req, res) => {
  const { codexController } = await import('./controllers/codexController.js');
  codexController.submitExercise(req, res);
});

app.get('/api/challenges', async (req, res) => {
  const { riftController } = await import('./controllers/riftController.js');
  riftController.getChallenges(req, res);
});

app.get('/api/challenges/:id', async (req, res) => {
  const { riftController } = await import('./controllers/riftController.js');
  riftController.getChallenge(req, res);
});

app.post('/api/challenges/:id/submit', async (req, res) => {
  const { riftController } = await import('./controllers/riftController.js');
  riftController.submitChallenge(req, res);
});

app.get('/api/projects', async (req, res) => {
  const { riftController } = await import('./controllers/riftController.js');
  riftController.getProjects(req, res);
});

app.post('/api/projects', async (req, res) => {
  const { riftController } = await import('./controllers/riftController.js');
  riftController.createProject(req, res);
});

app.post('/api/projects/:id/like', async (req, res) => {
  const { riftController } = await import('./controllers/riftController.js');
  riftController.likeProject(req, res);
});

app.get('/api/leaderboard', async (req, res) => {
  const { supabase } = await import('./config/supabase.js');
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
});

app.listen(PORT, () => {
  console.log(`Devion API running on port ${PORT}`);
});

export default app;
