import { useEffect, useState } from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Nav from './components/Nav';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Course from './components/Course';
import Lesson from './components/Lesson';
import Challenges from './components/Challenges';
import Achievements from './pages/Achievements';
import Profile from './pages/Profile';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const initAuth = async () => {
      const token = searchParams.get('token');
      const userData = searchParams.get('user');

      if (token) {
        try {
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (!error && user) {
            setIsAuthenticated(true);
            setUser(user);
            localStorage.setItem('devion-auth-token', token);
            localStorage.setItem('devion-user', userData || '');
          }
        } catch (err) {
          console.error('Auth validation failed:', err);
        }
      } else {
        const storedToken = localStorage.getItem('devion-auth-token');
        if (storedToken) {
          const { data: { user }, error } = await supabase.auth.getUser(storedToken);
          if (!error && user) {
            setIsAuthenticated(true);
            setUser(user);
          }
        }
      }
    };

    initAuth();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-dark-900">
      <Nav isAuthenticated={isAuthenticated} user={user} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<Course />} />
        <Route path="/courses/:courseId/modules/:moduleId" element={<Lesson />} />
        <Route path="/courses/:courseId/modules/:moduleId/lessons/:lessonId" element={<Lesson />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;
