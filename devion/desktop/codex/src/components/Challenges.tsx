import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  points: number;
}

function Challenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetch(`${API_BASE}/api/challenges`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setChallenges(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredChallenges = filter === 'all' 
    ? challenges 
    : challenges.filter(c => c.difficulty === filter);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
          <div className="w-48 h-8 rounded bg-dark-700 mb-2" />
          <div className="w-64 h-4 rounded bg-dark-700" />
        </header>
        <main className="p-6 max-w-6xl mx-auto">
          <div className="flex gap-2 mb-6">
            {['all', 'easy', 'medium', 'hard'].map(f => (
              <div key={f} className="px-4 py-2 rounded-lg bg-dark-800 w-20 h-10" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-16 h-6 rounded bg-dark-700" />
                  <div className="w-12 h-4 rounded bg-dark-700" />
                </div>
                <div className="w-48 h-6 rounded bg-dark-700 mb-2" />
                <div className="w-full h-4 rounded bg-dark-700 mb-3" />
                <div className="w-24 h-3 rounded bg-dark-700" />
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
        <h1 className="text-2xl font-bold text-white">Challenges</h1>
        <p className="text-dark-400">Test your skills with coding challenges</p>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <div className="flex gap-2 mb-6">
          {['all', 'easy', 'medium', 'hard'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-dark-800 text-dark-400 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filteredChallenges.length === 0 ? (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center">
            <p className="text-dark-400">No challenges available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChallenges.map(challenge => (
              <div
                key={challenge.id}
                className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <span className="text-blue-400 text-sm font-medium">{challenge.points} pts</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{challenge.title}</h3>
                <p className="text-dark-400 text-sm mb-3 line-clamp-2">{challenge.description}</p>
                <span className="text-dark-500 text-xs">{challenge.category}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Challenges;