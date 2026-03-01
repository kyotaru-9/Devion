import { useState, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { BookOpen, Gamepad2, Hammer, Play, Loader2, Github, Twitter, Linkedin, Globe, Circle, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { VerifyPage } from './components/VerifyPage';
import CodexButton from './components/CodexButton';
import './App.css';

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const LogOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M15 9l-6 6" />
    <path d="M9 9l6 6" />
  </svg>
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const modes = [
  {
    id: 'codex',
    name: 'Codex',
    description: 'Learn programming fundamentals with structured courses and interactive lessons',
    icon: BookOpen,
  },
  {
    id: 'rift',
    name: 'Rift',
    description: 'Level up with gamified visual challenges, achievements, and interactive coding quests',
    icon: Gamepad2,
    comingSoon: true,
  },
  {
    id: 'forge',
    name: 'Forge',
    description: 'Master algorithms with LeetCode-style problems and track your progress',
    icon: Hammer,
    comingSoon: true,
  },
];

function App() {
  const [selectedMode, setSelectedMode] = useState<string | null>('codex');
  const [isLoading, setIsLoading] = useState(false);
  const [isAppRunning, setIsAppRunning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarClosing, setIsSidebarClosing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isModeSwitchCooldown, setIsModeSwitchCooldown] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [openApps, setOpenApps] = useState<Set<string>>(() => {
    // Load from localStorage on initialization
    const stored = localStorage.getItem('devion-open-apps');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const [windowRefs, setWindowRefs] = useState<Map<string, Window>>(new Map());
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if this is an email verification flow
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'signup') {
      setIsVerifying(true);
      setCheckingAuth(false);
      return;
    }

    // Restore token to electronAPI from localStorage on startup
    const storedToken = localStorage.getItem('devion-auth-token');
    if (storedToken && window.electronAPI?.setAuthToken) {
      window.electronAPI.setAuthToken(storedToken);
    }

    // Normal auth check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
      setCheckingAuth(false);
      // Store session for sharing with child apps
      if (session) {
        localStorage.setItem('devion-auth-token', session.access_token);
        localStorage.setItem('devion-user', JSON.stringify(session.user));
        if (window.electronAPI?.setAuthToken) {
          window.electronAPI.setAuthToken(session.access_token);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
      // Store session for sharing with child apps
      if (session) {
        localStorage.setItem('devion-auth-token', session.access_token);
        localStorage.setItem('devion-user', JSON.stringify(session.user));
        if (window.electronAPI?.setAuthToken) {
          window.electronAPI.setAuthToken(session.access_token);
        }
      } else {
        localStorage.removeItem('devion-auth-token');
        localStorage.removeItem('devion-user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Persist openApps to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('devion-open-apps', JSON.stringify([...openApps]));
  }, [openApps]);

  // Check if selected app is running
  useEffect(() => {
    if (!selectedMode || !window.electronAPI?.isAppRunning) {
      setIsAppRunning(false);
      return;
    }

    const checkRunning = async () => {
      if (!window.electronAPI) return;
      try {
        const running = await window.electronAPI.isAppRunning(selectedMode);
        setIsAppRunning(running);
      } catch (err) {
        console.warn('Could not check if app is running:', err);
        setIsAppRunning(false);
      }
    };

    checkRunning();
    const interval = setInterval(checkRunning, 2000);
    return () => clearInterval(interval);
  }, [selectedMode]);

  // Cleanup mechanism for closed windows using heartbeat system
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const heartbeatTimeout = 5000; // 5 seconds
      
      openApps.forEach(app => {
        const heartbeatKey = `devion-${app}-heartbeat`;
        const lastHeartbeat = localStorage.getItem(heartbeatKey);
        
        if (lastHeartbeat) {
          const timeSinceHeartbeat = now - parseInt(lastHeartbeat);
          if (timeSinceHeartbeat > heartbeatTimeout) {
            // App appears to be closed, remove from tracking
            console.log(`${app} appears to be closed (no heartbeat), removing from tracking`);
            setOpenApps(prev => {
              const newSet = new Set(prev);
              newSet.delete(app);
              return newSet;
            });
            localStorage.removeItem(heartbeatKey);
          }
        } else {
          // No heartbeat found, assume closed
          console.log(`No heartbeat found for ${app}, removing from tracking`);
          setOpenApps(prev => {
            const newSet = new Set(prev);
            newSet.delete(app);
            return newSet;
          });
        }
      });
    }, 2000); // Check every 2 seconds

    return () => clearInterval(cleanupInterval);
  }, [openApps]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log('🖱️ Click detected, showProfileMenu:', showProfileMenu);
      
      const target = event.target as Node;
      const profileContainer = profileRef.current;
      
      // Check if click is outside both the profile button and the sidebar
      const clickedOutsideProfile = profileContainer && !profileContainer.contains(target);
      const sidebar = document.querySelector('.profile-sidebar');
      const clickedOutsideSidebar = sidebar && !sidebar.contains(target);
      
      if (clickedOutsideProfile && clickedOutsideSidebar) {
        console.log('🎯 Click outside both profile and sidebar detected, closing sidebar');
        setShowProfileMenu(false);
      } else {
        console.log('🎯 Click inside profile container or sidebar');
      }
    };

    if (showProfileMenu) {
      console.log('📋 Adding click outside listener');
      // Use capture phase to ensure we catch the event before other handlers
      document.addEventListener('mousedown', handleClickOutside, true);
    }

    return () => {
      console.log('🧹 Removing click outside listener');
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [showProfileMenu]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const closeSidebar = () => {
    setIsSidebarClosing(true);
    setTimeout(() => {
      setIsSidebarClosing(false);
      setShowProfileMenu(false);
    }, 250);
  };

  const handleModeChange = (modeId: string) => {
    if (modeId === selectedMode || isModeSwitchCooldown) return;
    setIsModeSwitchCooldown(true);
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedMode(modeId);
      setTimeout(() => {
        setIsTransitioning(false);
        setIsModeSwitchCooldown(false);
      }, 400);
    }, 400);
  };

  const handlePlay = async () => {
    console.log('🚀 handlePlay called');
    console.log('electronAPI exists:', !!window.electronAPI);
    console.log('selectedMode:', selectedMode);
    
    if (selectedMode) {
      // Check if app is already running using Electron IPC
      if (window.electronAPI) {
        console.log('📡 Using Electron IPC mode');
        try {
          console.log('🔍 Checking if app is running:', selectedMode);
          const isRunning = await window.electronAPI.isAppRunning(selectedMode);
          console.log('📊 isAppRunning result:', isRunning);
          
          if (isRunning) {
            console.log(`🔄 ${selectedMode} is already running - FOCUSING WINDOW`);
            try {
              await window.electronAPI.focusApp(selectedMode);
            } catch (err) {
              console.warn('⚠️ Could not focus app window:', err);
            }
            return;
          } else {
            console.log(`✅ ${selectedMode} is not running - PROCEEDING WITH LAUNCH`);
          }
        } catch (err) {
          console.warn('⚠️ Could not check if app is running:', err);
        }
      } else {
        console.log('🌐 Using browser fallback mode');
        // Fallback to localStorage checking for browser mode
        if (openApps.has(selectedMode)) {
          console.log(`${selectedMode} is already open in browser mode`);
          toast.error(`${selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} is already running!`, {
            duration: 3000,
            position: 'top-right',
          });
          return;
        }
      }

      console.log(`🚀 Launching ${selectedMode}...`);
      setIsLoading(true);
      
      if (window.electronAPI) {
        console.log('📡 Calling Electron launchApp API');
        // Use Electron API for launching
        try {
          const result = await window.electronAPI.launchApp(selectedMode);
          console.log('📊 Launch result:', result);
          if (result.success) {
            console.log('✅ Launch successful');
            // Electron handles the tracking internally
            setIsLoading(false);
          } else {
            console.error('❌ Launch failed:', result.error);
            toast.error(`Failed to launch ${selectedMode}: ${result.error}`, {
              duration: 4000,
              position: 'top-right',
            });
            setIsLoading(false);
          }
        } catch (err) {
          console.error('💥 Launch error:', err);
          toast.error(`Failed to launch ${selectedMode}`, {
            duration: 4000,
            position: 'top-right',
          });
          setIsLoading(false);
        }
      } else {
        console.log('🌐 Browser mode - opening window directly');
        // Browser fallback mode
        console.log('Running in browser mode - opening app directly');
        const ports = { codex: 5174, rift: 5175, forge: 5176 };
        const token = localStorage.getItem('devion-auth-token');
        const url = token 
          ? `http://localhost:${ports[selectedMode as keyof typeof ports]}?token=${encodeURIComponent(token)}`
          : `http://localhost:${ports[selectedMode as keyof typeof ports]}`;
        const newWindow = window.open(url, '_blank');
        
        if (newWindow) {
          console.log('🪟 Window opened successfully');
          // Inject heartbeat script into the child window
          const heartbeatScript = `
            (function() {
              const heartbeatKey = 'devion-${selectedMode}-heartbeat';
              setInterval(() => {
                localStorage.setItem(heartbeatKey, Date.now().toString());
              }, 1000); // Update every second
              
              // Clear heartbeat on page unload
              window.addEventListener('beforeunload', () => {
                localStorage.removeItem(heartbeatKey);
              });
            })();
          `;
          
          // Wait a bit for the window to load, then inject the script
          setTimeout(() => {
            try {
              // Use type assertion to access eval method
              (newWindow as any).eval(heartbeatScript);
              console.log('💉 Heartbeat script injected');
            } catch (e) {
              console.warn('⚠️ Could not inject heartbeat script, falling back to localStorage events:', e);
              // Fallback: just rely on localStorage event detection
            }
          }, 2000);
          
          // Store window reference
          setWindowRefs(prev => new Map(prev).set(selectedMode, newWindow));
          // Add to open apps set
          setOpenApps(prev => new Set(prev).add(selectedMode));
          
          // Set up fallback cleanup when window closes
          const checkClosed = setInterval(() => {
            if (newWindow.closed) {
              console.log(`🗑️ Window closed, cleaning up ${selectedMode}`);
              clearInterval(checkClosed);
              setOpenApps(prev => {
                const newSet = new Set(prev);
                newSet.delete(selectedMode);
                return newSet;
              });
              setWindowRefs(prev => {
                const newMap = new Map(prev);
                newMap.delete(selectedMode);
                return newMap;
              });
              // Clean up heartbeat
              localStorage.removeItem(`devion-${selectedMode}-heartbeat`);
            }
          }, 1000);
        } else {
          console.log('❌ Failed to open window');
        }
        
        setIsLoading(false);
      }
    } else {
      console.log('⚠️ No selectedMode');
    }
  };

  if (checkingAuth) {
    return (
      <div className="loading-container">
        <Loader2 className="loading-spinner" />
      </div>
    );
  }

  if (isVerifying) {
    return (
      <>
        <Toaster position="top-right" />
        <VerifyPage />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" />
        <Auth onAuthSuccess={() => setIsAuthenticated(true)} />
      </>
    );
  }

  return (
    <div className={`app-container ${selectedMode || 'codex'}`}>
      <Toaster position="top-right" />
      <div className="profile-container" ref={profileRef}>
        <button
          className="profile-button"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <div className="profile-circle">
            <UserIcon />
          </div>
        </button>
        {showProfileMenu && (
          <>
            <div className={`sidebar-backdrop ${isSidebarClosing ? 'closing' : ''}`} onClick={closeSidebar} />
            <div className={`profile-sidebar ${isSidebarClosing ? 'closing' : ''}`}>
            <div className="sidebar-content">
              <div className="sidebar-user">
                <div className="sidebar-avatar">
                  <UserIcon />
                </div>
                <div className="sidebar-user-info">
                  <h3 className="sidebar-user-name">{user?.user_metadata?.full_name || user?.email || 'User'}</h3>
                  <span className="sidebar-user-status">
                    <span className="status-dot"></span>
                    Online
                  </span>
                </div>
              </div>
              <div className="sidebar-stats">
                <div className="stat-item">
                  <span className="stat-value">0</span>
                  <span className="stat-label">Courses</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-value">0</span>
                  <span className="stat-label">Challenges</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-value">0</span>
                  <span className="stat-label">Streak</span>
                </div>
              </div>
              <nav className="sidebar-nav">
                <button className="sidebar-nav-item">
                  <SettingsIcon />
                  <span>Settings</span>
                  <svg className="nav-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
                <button className="sidebar-nav-item" onClick={handleLogout}>
                  <LogOutIcon />
                  <span>Sign Out</span>
                  <svg className="nav-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </nav>
              <div className="sidebar-footer">
                <p className="footer-version">Devion v1.0.0</p>
                <p className="footer-hint">Click outside to hide</p>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
      <div className="title-section">
        <h1 className="app-title">
          Devion
        </h1>
        <p className="app-description">
          Master programming through interactive learning experiences. Choose from structured courses, coding challenges, and algorithm practice to build your skills and advance your development career.
        </p>
      </div>

      <div className="mode-selector">
        <button 
          className={`mode-nav-btn ${isModeSwitchCooldown ? 'cooldown' : ''}`}
          onClick={() => {
            const currentIndex = modes.findIndex(m => m.id === selectedMode);
            const prevIndex = currentIndex <= 0 ? modes.length - 1 : currentIndex - 1;
            handleModeChange(modes[prevIndex].id);
          }}
        >
          <ChevronLeft />
        </button>
        <div className="mode-display">
          {(() => {
            const mode = modes.find(m => m.id === selectedMode);
            if (!mode) return null;
            const Icon = mode.icon;
            return (
              <div 
                className={`mode-card ${mode.comingSoon ? 'coming-soon' : ''}`}
                onClick={() => !mode.comingSoon && handleModeChange(mode.id)}
              >
                <Icon className="mode-card-icon" />
                <span className="mode-card-name">{mode.name}</span>
                <span className="mode-card-desc">{mode.description}</span>
              </div>
            );
          })()}
        </div>
        <button 
          className={`mode-nav-btn ${isModeSwitchCooldown ? 'cooldown' : ''}`}
          onClick={() => {
            const currentIndex = modes.findIndex(m => m.id === selectedMode);
            const nextIndex = currentIndex >= modes.length - 1 ? 0 : currentIndex + 1;
            handleModeChange(modes[nextIndex].id);
          }}
        >
          <ChevronRight />
        </button>
      </div>

      {isTransitioning && <div className="mode-transition-overlay" />}

      {selectedMode === 'codex' ? (
        <CodexButton
          onClick={handlePlay}
          disabled={!selectedMode || isLoading}
          className="play-button"
        >
          {isLoading ? (
            <>
              <Loader2 className="loading-spinner" />
              Loading...
            </>
          ) : isAppRunning ? (
            'Running'
          ) : (
            'Start'
          )}
        </CodexButton>
      ) : (
        <button
          onClick={handlePlay}
          disabled={!selectedMode || isLoading || selectedMode === 'rift' || selectedMode === 'forge'}
          className={`play-button ${isLoading ? 'loading' : isAppRunning ? 'running' : selectedMode && selectedMode !== 'rift' && selectedMode !== 'forge' ? 'enabled' : selectedMode === 'rift' || selectedMode === 'forge' ? 'coming-soon' : ''}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="loading-spinner" />
              Loading...
            </>
          ) : isAppRunning ? (
            <>
              <Circle className="running-dot" />
              Running
            </>
          ) : selectedMode === 'rift' || selectedMode === 'forge' ? (
            <>
              Coming Soon
            </>
          ) : (
            <>
              <Play />
              Start
            </>
          )}
        </button>
      )}

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <p className="footer-description">
              Empowering developers through interactive learning experiences and coding challenges.
            </p>
            <p className="footer-version">v1.0.0 • Desktop App</p>
          </div>
          <div className="footer-right">
            <div className="social-links">
              <a href="#" className="social-link" aria-label="GitHub">
                <Github />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <Linkedin />
              </a>
              <a href="#" className="social-link" aria-label="Website">
                <Globe />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
