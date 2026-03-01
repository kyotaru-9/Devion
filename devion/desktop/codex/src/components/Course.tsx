import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimated_hours: number;
  modules: Module[];
}

function Course() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/api/courses/${id}`)
      .then(res => res.json())
      .then(data => {
        setCourse(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-20 h-4 rounded bg-dark-700" />
          </div>
          <div className="w-64 h-8 rounded bg-dark-700 mb-2" />
          <div className="w-96 h-4 rounded bg-dark-700" />
        </header>
        <main className="p-6 max-w-4xl mx-auto">
          <div className="w-40 h-6 rounded bg-dark-700 mb-4" />
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-dark-700" />
                  <div className="flex-1 space-y-2">
                    <div className="w-48 h-5 rounded bg-dark-700" />
                    <div className="w-64 h-4 rounded bg-dark-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-400 mb-4">Course not found</p>
          <Link to="/courses" className="text-blue-400 hover:underline">Back to Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
        <Link to="/courses" className="flex items-center gap-2 text-dark-400 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>
        <h1 className="text-2xl font-bold text-white">{course.title}</h1>
        <p className="text-dark-400">{course.description}</p>
        <div className="flex gap-4 mt-2 text-sm text-dark-500">
          <span>{course.difficulty}</span>
          <span>•</span>
          <span>{course.estimated_hours} hours</span>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold text-white mb-4">Course Content</h2>
        <div className="space-y-3">
          {course.modules?.map((module, index) => (
            <Link
              key={module.id}
              to={`/courses/${id}/modules/${module.id}`}
              className="block bg-dark-800 border border-dark-700 rounded-xl p-4 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center text-dark-400">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{module.title}</h3>
                  <p className="text-sm text-dark-400">{module.description}</p>
                </div>
                <BookOpen className="w-5 h-5 text-dark-500" />
              </div>
            </Link>
          ))}
          {(!course.modules || course.modules.length === 0) && (
            <p className="text-dark-400 text-center py-8">No modules available yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Course;