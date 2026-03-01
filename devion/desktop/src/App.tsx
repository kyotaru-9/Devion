import { useState, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { BookOpen, Gamepad2, Hammer, Play, Loader2, LogOut, Settings, User, Github, Twitter, Linkedin, Globe } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { VerifyPage } from './components/VerifyPage';
import './App.css';

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
    description: 'Challenge yourself with timed coding challenges and build projects',
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
            console.log(`❌ ${selectedMode} is already running - BLOCKING LAUNCH`);
            toast.error(`${selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} is already running!`, {
              duration: 3000,
              position: 'top-right',
            });
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
    <div className="app-container">
      <Toaster position="top-right" />
      <div className="profile-container" ref={profileRef}>
        <button 
          className="profile-button"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <div className="profile-circle">
            <User />
          </div>
        </button>
        {showProfileMenu && (
          <div className="profile-sidebar">
            <div className="profile-header">
              <div className="profile-avatar">
                <User />
              </div>
              <div className="profile-info">
                <span className="profile-name">
                  {user?.user_metadata?.full_name || user?.email || 'User'}
                </span>
                <span className="profile-status">Online</span>
              </div>
            </div>
            <div className="profile-actions">
              <button className="profile-menu-item">
                <Settings />
                <span>Settings</span>
              </button>
              <button className="profile-menu-item" onClick={handleLogout}>
                <LogOut />
                <span>Sign Out</span>
              </button>
              <div className="profile-divider"></div>
              <button className="profile-menu-item" onClick={() => {
                setOpenApps(new Set());
                setWindowRefs(new Map());
                localStorage.removeItem('devion-open-apps');
                toast.success('App tracking reset!');
              }}>
                🔄
                <span>Reset App Tracking</span>
              </button>
              <div className="profile-footer">
              </div>
            </div>
          </div>
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

      <div className="mode-switcher">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              disabled={isLoading || mode.comingSoon}
              className={`mode-switch-item ${isSelected ? 'active' : ''} ${mode.comingSoon ? 'coming-soon' : ''}`}
            >
              <Icon className="mode-switch-icon" />
              <span className="mode-switch-name">{mode.name}</span>
              {isSelected && <div className="mode-switch-indicator" />}
            </button>
          );
        })}
      </div>

      <button
        onClick={handlePlay}
        disabled={!selectedMode || isLoading || selectedMode === 'rift' || selectedMode === 'forge'}
        className={`play-button ${isLoading ? 'loading' : selectedMode && selectedMode !== 'rift' && selectedMode !== 'forge' ? 'enabled' : selectedMode === 'rift' || selectedMode === 'forge' ? 'coming-soon' : ''}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="loading-spinner" />
            Loading...
          </>
        ) : selectedMode === 'rift' || selectedMode === 'forge' ? (
          <>
            Coming Soon
          </>
        ) : (
          <>
            <Play />
            Play
          </>
        )}
      </button>

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
