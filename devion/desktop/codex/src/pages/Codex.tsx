import { useState, useEffect } from 'react';
import { BookOpen, Loader2, Lock } from 'lucide-react';
import CourseCard from '../components/CourseCard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

function Codex() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split('; ');
      const authCookie = cookies.find(c => c.startsWith('devion-auth='));
      const hasSession = !!(authCookie && authCookie.split('=')[1]);
      setIsAuthenticated(hasSession);

      fetch(`${API_BASE}/api/courses`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setCourses(data);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-dark-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Login Required</h2>
          <p className="text-dark-400 mb-6">Please sign in to access Codex</p>
          <a
            href="http://localhost:5173"
            className="inline-block px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Codex</h1>
            <p className="text-sm text-dark-400">Learn programming fundamentals</p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold text-white mb-4">Available Courses</h2>
        {courses.length === 0 ? (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center">
            <BookOpen className="w-12 h-12 text-dark-500 mx-auto mb-4" />
            <p className="text-dark-400">No courses available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                description={course.description}
                difficulty={course.difficulty}
                onClick={() => setSelectedCourse(course.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Codex;
