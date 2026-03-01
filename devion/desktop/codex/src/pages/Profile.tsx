import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Trophy, Code2, Flame, Edit2, Save } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
}

interface Stats {
  total_points: number;
  challenges_completed: number;
  exercises_completed: number;
  current_streak: number;
  longest_streak: number;
}

function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('devion-user');
    if (!userStr) {
      setLoading(false);
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setProfile(userData);
      setEditedBio(userData.bio || '');

      fetch(`${API_BASE}/api/users/${userData.id}/stats`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setStats(data);
        })
        .catch(console.error);
    } catch (e) {
      console.error('Failed to parse user data:', e);
    }

    setLoading(false);
  }, []);

  const handleSaveBio = () => {
    const updatedUser = { ...profile, bio: editedBio };
    localStorage.setItem('devion-user', JSON.stringify(updatedUser));
    setProfile(updatedUser);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-dark-700" />
            <div className="space-y-2">
              <div className="w-24 h-6 rounded bg-dark-700" />
              <div className="w-32 h-4 rounded bg-dark-700" />
            </div>
          </div>
        </header>
        <main className="p-6 max-w-4xl mx-auto">
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-dark-700" />
              <div className="flex-1">
                <div className="w-48 h-8 rounded bg-dark-700 mb-2" />
                <div className="flex gap-4 mb-4">
                  <div className="w-40 h-4 rounded bg-dark-700" />
                  <div className="w-32 h-4 rounded bg-dark-700" />
                </div>
                <div className="w-full h-10 rounded bg-dark-700" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-dark-700" />
                  <div className="w-16 h-4 rounded bg-dark-700" />
                </div>
                <div className="w-20 h-8 rounded bg-dark-700" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-400 mb-4">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Profile</h1>
            <p className="text-sm text-dark-400">Manage your account</p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white">
              {profile.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-white">{profile.username || 'User'}</h2>
              </div>
              <div className="flex items-center gap-4 text-dark-400 mb-4">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(profile.created_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      placeholder="Write a bio..."
                      className="flex-1 px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleSaveBio}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-dark-400 flex-1">{profile.bio || 'No bio yet'}</p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 px-3 py-2 bg-dark-700 text-dark-400 rounded-lg hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <span className="text-dark-400">Points</span>
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
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-dark-400">Streak</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.current_streak} days</p>
            </div>
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-dark-400">Best Streak</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.longest_streak} days</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Profile;