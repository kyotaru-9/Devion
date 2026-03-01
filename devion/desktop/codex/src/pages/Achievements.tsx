import { useState, useEffect } from 'react';
import { Trophy, Star, Medal, Zap, Award, Lock, Flame } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  points: number;
  earned: boolean;
  requirement: number;
  current: number;
}

function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ total_points: number; challenges_completed: number; exercises_completed: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userStr = localStorage.getItem('devion-user');
        let userId = null;
        if (userStr) {
          const userData = JSON.parse(userStr);
          userId = userData.id;
        }

        if (userId) {
          const statsRes = await fetch(`${API_BASE}/api/users/${userId}/stats`);
          const statsData = await statsRes.json();
          if (!statsData.error) {
            setStats(statsData);
          }
        }
      } catch (e) {
        console.error('Failed to fetch user stats:', e);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const allAchievements: Achievement[] = [
      { id: 1, name: 'First Steps', description: 'Complete your first lesson', icon: 'Star', color: 'bg-yellow-500/20 text-yellow-400', points: 50, earned: false, requirement: 1, current: stats?.exercises_completed || 0 },
      { id: 2, name: 'Challenge Accepted', description: 'Complete your first challenge', icon: 'Trophy', color: 'bg-blue-500/20 text-blue-400', points: 100, earned: false, requirement: 1, current: stats?.challenges_completed || 0 },
      { id: 3, name: 'Problem Solver', description: 'Solve 10 challenges', icon: 'Medal', color: 'bg-purple-500/20 text-purple-400', points: 250, earned: false, requirement: 10, current: stats?.challenges_completed || 0 },
      { id: 4, name: 'Speed Demon', description: 'Complete a challenge in under 5 minutes', icon: 'Zap', color: 'bg-orange-500/20 text-orange-400', points: 150, earned: false, requirement: 1, current: 0 },
      { id: 5, name: 'Course Master', description: 'Complete 5 courses', icon: 'Award', color: 'bg-green-500/20 text-green-400', points: 500, earned: false, requirement: 5, current: 0 },
      { id: 6, name: 'Streak Champion', description: 'Maintain a 7-day streak', icon: 'Flame', color: 'bg-red-500/20 text-red-400', points: 200, earned: false, requirement: 7, current: 0 },
      { id: 7, name: 'Code Warrior', description: 'Complete 50 challenges', icon: 'Trophy', color: 'bg-cyan-500/20 text-cyan-400', points: 1000, earned: false, requirement: 50, current: stats?.challenges_completed || 0 },
      { id: 8, name: 'Perfectionist', description: 'Get 100% on 10 exercises', icon: 'Star', color: 'bg-pink-500/20 text-pink-400', points: 300, earned: false, requirement: 10, current: stats?.exercises_completed || 0 },
    ];

    const withProgress = allAchievements.map(a => ({
      ...a,
      earned: a.current >= a.requirement
    }));

    setAchievements(withProgress);
  }, [stats]);

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalPoints = achievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-dark-700" />
            <div className="space-y-2">
              <div className="w-32 h-6 rounded bg-dark-700" />
              <div className="w-40 h-4 rounded bg-dark-700" />
            </div>
          </div>
        </header>
        <main className="p-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[1,2,3].map(i => (
              <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-dark-700" />
                  <div className="w-16 h-4 rounded bg-dark-700" />
                </div>
                <div className="w-20 h-8 rounded bg-dark-700" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-dark-700" />
                  <div className="w-12 h-4 rounded bg-dark-700" />
                </div>
                <div className="w-32 h-5 rounded bg-dark-700 mb-2" />
                <div className="w-48 h-4 rounded bg-dark-700" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Star, Trophy, Medal, Zap, Award, Flame
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Achievements</h1>
            <p className="text-sm text-dark-400">Track your accomplishments</p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-dark-400">Earned</span>
            </div>
            <p className="text-2xl font-bold text-white">{earnedCount} / {achievements.length}</p>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-dark-400">Total Points</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalPoints}</p>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-dark-400">Progress</span>
            </div>
            <p className="text-2xl font-bold text-white">{Math.round(achievements.length > 0 ? (earnedCount / achievements.length) * 100 : 0)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map(achievement => {
            const IconComponent = iconMap[achievement.icon] || Star;
            return (
              <div
                key={achievement.id}
                className={`relative bg-dark-800 border rounded-xl p-6 ${
                  achievement.earned
                    ? 'border-dark-700'
                    : 'border-dark-700 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${achievement.color}`}>
                    {achievement.earned ? (
                      <IconComponent className="w-6 h-6" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    achievement.earned ? 'text-yellow-400' : 'text-dark-500'
                  }`}>
                    {achievement.points} pts
                  </span>
                </div>
                <h3 className="font-semibold text-white mb-1">{achievement.name}</h3>
                <p className="text-sm text-dark-400">{achievement.description}</p>
                {achievement.earned && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Achievements;