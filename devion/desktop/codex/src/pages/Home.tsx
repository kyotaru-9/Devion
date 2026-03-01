import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Code2, Trophy, Flame, ArrowRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

interface Stats {
  total_points: number;
  challenges_completed: number;
  current_streak: number;
}

function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesRes = await fetch(`${API_BASE}/api/courses`);
        const coursesData = await coursesRes.json();
        if (Array.isArray(coursesData)) {
          setCourses(coursesData.slice(0, 3));
        }
      } catch (e) {
        console.error('Failed to fetch courses:', e);
      }

      try {
        const user = localStorage.getItem('devion-user');
        if (user) {
          const userData = JSON.parse(user);
          const statsRes = await fetch(`${API_BASE}/api/users/${userData.id}/stats`);
          const statsData = await statsRes.json();
          if (!statsData.error) {
            setStats(statsData);
          }
        }
      } catch (e) {
        console.error('Failed to fetch stats:', e);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <header className="bg-dark-800 border-b border-dark-700 px-6 py-16">
          <div className="max-w-6xl mx-auto text-center">
            <div className="w-96 h-12 rounded bg-dark-700 mx-auto mb-4" />
            <div className="w-80 h-6 rounded bg-dark-700 mx-auto mb-8" />
            <div className="flex justify-center gap-4">
              <div className="w-40 h-12 rounded-lg bg-dark-700" />
              <div className="w-44 h-12 rounded-lg bg-dark-700" />
            </div>
          </div>
        </header>
        <main className="p-6 max-w-6xl mx-auto">
          <section className="mb-12">
            <div className="w-32 h-6 rounded bg-dark-700 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                  <div className="w-48 h-6 rounded bg-dark-700 mb-2" />
                  <div className="w-full h-4 rounded bg-dark-700 mb-3" />
                  <div className="w-16 h-6 rounded bg-dark-700" />
                </div>
              ))}
            </div>
          </section>
          <section>
            <div className="w-28 h-6 rounded bg-dark-700 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2].map(i => (
                <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-dark-700" />
                  <div className="space-y-2">
                    <div className="w-36 h-5 rounded bg-dark-700" />
                    <div className="w-56 h-4 rounded bg-dark-700" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <header className="bg-dark-800 border-b border-dark-700 px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Devion</span>
          </h1>
          <p className="text-xl text-dark-400 mb-8">
            Learn to code through interactive courses, challenges, and projects
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/courses"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Start Learning
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/challenges"
              className="flex items-center gap-2 px-6 py-3 bg-dark-800 text-white border border-dark-700 rounded-lg font-medium hover:bg-dark-700 transition-colors"
            >
              <Trophy className="w-4 h-4" />
              View Challenges
            </Link>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        {stats && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-4">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="text-dark-400">Total Points</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.total_points}</p>
              </div>
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-dark-400">Challenges</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.challenges_completed}</p>
              </div>
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="text-dark-400">Streak</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.current_streak} days</p>
              </div>
            </div>
          </section>
        )}

        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Featured Courses</h2>
            <Link to="/courses" className="text-blue-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {courses.length === 0 ? (
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center">
              <BookOpen className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <p className="text-dark-400">No courses available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {courses.map(course => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                  <p className="text-sm text-dark-400 mb-3 line-clamp-2">{course.description}</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    course.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                    course.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {course.difficulty}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/roadmap"
              className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Learning Roadmap</h3>
                <p className="text-sm text-dark-400">Follow a structured path to master programming</p>
              </div>
            </Link>
            <Link
              to="/achievements"
              className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Achievements</h3>
                <p className="text-sm text-dark-400">Track your accomplishments and badges</p>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;