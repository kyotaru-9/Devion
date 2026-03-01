import { useState, useEffect } from 'react';
import { Gamepad2, Trophy, Clock, Users, Loader2, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  points: number;
  time_limit: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  likes_count: number;
  is_public: boolean;
  profiles?: { username: string };
}

interface UserStats {
  total_points: number;
  streak_days: number;
}

function Rift() {
  const [activeTab, setActiveTab] = useState<'challenges' | 'projects'>('challenges');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      setIsAuthenticated(true);

      const [challengesRes, projectsRes, statsRes] = await Promise.all([
        supabase.from('challenges').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*, profiles(username)').eq('is_public', true).order('likes_count', { ascending: false }).limit(20),
        supabase.from('user_stats').select('total_points, streak_days').eq('user_id', session.user.id).single()
      ]);

      if (challengesRes.data) setChallenges(challengesRes.data);
      if (projectsRes.data) setProjects(projectsRes.data);
      if (statsRes.data) setUserStats(statsRes.data);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
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
          <p className="text-dark-400 mb-6">Please sign in to access Rift</p>
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Rift</h1>
            <p className="text-sm text-dark-400">Challenge yourself with timed coding</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2 text-dark-400">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">{userStats?.total_points ?? 0} pts</span>
            </div>
            <div className="flex items-center gap-2 text-dark-400">
              <Clock className="w-4 h-4 text-green-500" />
              <span className="text-sm">{userStats?.streak_days ?? 0} day streak</span>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-dark-700">
        <div className="flex gap-6 px-6">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'challenges'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-dark-400 hover:text-dark-300'
            }`}
          >
            Challenges
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'projects'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-dark-400 hover:text-dark-300'
            }`}
          >
            Community Projects
          </button>
        </div>
      </div>

      <main className="p-6 max-w-6xl mx-auto">
        {activeTab === 'challenges' ? (
          challenges.length === 0 ? (
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center">
              <Gamepad2 className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <p className="text-dark-400">No challenges available yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{challenge.title}</h3>
                      <p className="text-sm text-dark-400 mb-3">{challenge.description}</p>
                      <div className="flex items-center gap-4 text-sm text-dark-400">
                        <span className={`px-2 py-0.5 rounded ${
                          challenge.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                          challenge.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {challenge.difficulty}
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" /> {challenge.points} pts
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {challenge.time_limit}s
                        </span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          projects.length === 0 ? (
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center">
              <Users className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <p className="text-dark-400">No public projects yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                  <p className="text-sm text-dark-400 mb-3">{project.description}</p>
                  <div className="flex items-center justify-between text-sm text-dark-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {project.profiles?.username || 'Anonymous'}
                    </span>
                    <span>{project.likes_count} likes</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default Rift;
