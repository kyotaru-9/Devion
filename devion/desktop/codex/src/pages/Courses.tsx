import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import SearchBar from '../components/Search';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  useEffect(() => {
    fetch(`${API_BASE}/api/courses`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCourses(data);
          setFilteredCourses(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = courses;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.description?.toLowerCase().includes(query)
      );
    }
    
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(c => c.difficulty === difficultyFilter);
    }
    
    setFilteredCourses(filtered);
  }, [searchQuery, difficultyFilter, courses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-dark-700" />
            <div className="space-y-2">
              <div className="w-24 h-6 rounded bg-dark-700" />
              <div className="w-48 h-4 rounded bg-dark-700" />
            </div>
          </div>
        </header>
        <main className="p-6 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="w-full sm:w-64 h-10 rounded-lg bg-dark-800" />
            <div className="flex gap-2">
              {['all', 'beginner', 'intermediate', 'advanced'].map(d => (
                <div key={d} className="px-4 py-2 rounded-lg bg-dark-800 w-20 h-10" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-dark-700 mb-4" />
                  <div className="w-48 h-5 rounded bg-dark-700 mb-2" />
                  <div className="w-64 h-4 rounded bg-dark-700 mb-4" />
                  <div className="w-16 h-6 rounded bg-dark-700" />
                </div>
              </div>
            ))}
          </div>
        </main>
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
            <h1 className="text-xl font-bold text-white">Courses</h1>
            <p className="text-sm text-dark-400">Browse and enroll in courses</p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-full sm:w-64">
            <SearchBar onSearch={setSearchQuery} placeholder="Search courses..." />
          </div>
          <div className="flex gap-2">
            {['all', 'beginner', 'intermediate', 'advanced'].map(d => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  difficultyFilter === d
                    ? 'bg-blue-500 text-white'
                    : 'bg-dark-800 text-dark-400 hover:text-white'
                }`}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center">
            <BookOpen className="w-12 h-12 text-dark-500 mx-auto mb-4" />
            <p className="text-dark-400">No courses found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map(course => (
              <CourseCard
                key={course.id}
                title={course.title}
                description={course.description || ''}
                difficulty={course.difficulty?.charAt(0).toUpperCase() + course.difficulty?.slice(1) || 'Beginner'}
                onClick={() => navigate(`/courses/${course.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Courses;