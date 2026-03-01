import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Code2, Trophy, User, Award, LogOut } from 'lucide-react';

interface NavProps {
  isAuthenticated?: boolean;
  user?: any;
}

function Nav({ isAuthenticated, user }: NavProps) {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: BookOpen },
    { path: '/courses', label: 'Courses', icon: Code2 },
    { path: '/challenges', label: 'Challenges', icon: Trophy },
    { path: '/achievements', label: 'Achievements', icon: Award },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    localStorage.removeItem('devion-auth-token');
    localStorage.removeItem('devion-user');
    
    if (window.electronAPI?.closeApp) {
      await window.electronAPI.closeApp('codex');
    } else {
      window.close();
    }
  };

  return (
    <nav className="bg-dark-800 border-b border-dark-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Devion</span>
        </div>
        
        <div className="flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(path)
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-dark-400 hover:text-white hover:bg-dark-700 transition-colors ml-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Nav;