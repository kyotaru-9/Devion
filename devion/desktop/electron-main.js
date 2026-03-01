const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { exec } = require('child_process');

const isDev = !app.isPackaged;

// Hide the menu bar
Menu.setApplicationMenu(null);

// Track running app processes and windows
const runningApps = new Map(); // appName -> { process, window, port }

const appPorts = {
  codex: 5174,
  rift: 5175,
  forge: 5176,
};

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    title: 'Devion',
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

function waitForUrl(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      const http = require('http');
      const req = http.get(url, (res) => {
        if (res.statusCode === 200) resolve(true);
        else retry();
      });
      req.on('error', retry);
    };
    const retry = () => {
      if (Date.now() - startTime < timeout) setTimeout(check, 500);
      else reject(new Error('Timeout'));
    };
    check();
  });
}

// IPC handler to check if an app is already running
ipcMain.handle('is-app-running', (event, appName) => {
  return runningApps.has(appName);
});

// IPC handler to focus an already running app
ipcMain.handle('focus-app', (event, appName) => {
  const appData = runningApps.get(appName);
  if (appData && appData.window && !appData.window.isDestroyed()) {
    if (appData.window.isMinimized()) {
      appData.window.restore();
    }
    appData.window.focus();
    return { success: true };
  }
  return { success: false, error: 'App not found or window destroyed' };
});

// IPC handler to get list of running apps
ipcMain.handle('get-running-apps', () => {
  return Array.from(runningApps.keys());
});

// IPC handler to close/stop a running app
ipcMain.handle('close-app', (event, appName) => {
  const appData = runningApps.get(appName);
  if (appData) {
    try {
      if (appData.window && !appData.window.isDestroyed()) {
        appData.window.close();
      }
      if (appData.process) {
        appData.process.kill();
      }
    } catch (err) {
      console.error(`Error closing ${appName}:`, err);
    }
    runningApps.delete(appName);
    return { success: true };
  }
  return { success: false, error: 'App not found' };
});

ipcMain.handle('launch-app', async (event, appName) => {
  console.log('[launch-app] Received request for:', appName);
  
  // Check if app is already running
  if (runningApps.has(appName)) {
    console.log(`[launch-app] ${appName} is already running, rejecting request`);
    return { success: false, error: 'App is already running' };
  }
  
  const port = appPorts[appName];
  console.log('[launch-app] Using port:', port);
  
  if (!port) return { success: false, error: 'App not found' };

  const appDir = path.join(__dirname, appName);
  console.log('[launch-app] App directory:', appDir);

  return new Promise((resolve) => {
    // Start the sub-app's Vite dev server
    console.log('[launch-app] Starting vite dev server for:', appName);
    
    let actualPort = port;
    
    const viteProcess = spawn(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['run', 'dev:server'],
      { cwd: appDir, stdio: 'pipe' }
    );

    viteProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[${appName} vite] ${output}`);
      // Parse port from vite output
      const portMatch = output.match(/Local:\s+http:\/\/localhost:(\d+)/);
      if (portMatch) {
        actualPort = parseInt(portMatch[1]);
        console.log('[launch-app] Detected port:', actualPort);
      }
    });

    viteProcess.stderr.on('data', (data) => {
      console.error(`[${appName} vite error] ${data}`);
    });

    const url = `http://localhost:${actualPort}`;

    // Once the dev server is ready, open it in a new BrowserWindow
    waitForUrl(url, 15000)
      .then(() => {
        // Get user data from main window via preload
        const mainWindow = BrowserWindow.getAllWindows().find(w => w.getTitle() === 'Devion');
        
        if (mainWindow) {
          mainWindow.webContents.executeJavaScript(`
            JSON.stringify({
              token: window.electronAPI?.getAuthToken() || '',
              user: localStorage.getItem('devion-user') || ''
            })
          `)
            .then(data => {
              try {
                const { token, user } = JSON.parse(data);
                openCodexWindow(token, user);
              } catch(e) {
                openCodexWindow('', '');
              }
            })
            .catch(() => openCodexWindow('', ''));
        } else {
          openCodexWindow('', '');
        }

        function openCodexWindow(token, user) {
          let codexUrl = url;
          if (token) codexUrl += `?token=${encodeURIComponent(token)}`;
          if (user) codexUrl += `&user=${encodeURIComponent(user)}`;
          
          const win = new BrowserWindow({
            width: 1280,
            height: 800,
            webPreferences: {
              nodeIntegration: false,
              contextIsolation: true,
            },
            title: `Devion ${appName.charAt(0).toUpperCase() + appName.slice(1)}`,
          });

          win.loadURL(codexUrl);

          // Track the running app
          runningApps.set(appName, {
            process: viteProcess,
            window: win,
            port: port
          });

          // Handle window close
          win.on('closed', () => {
            console.log(`[launch-app] ${appName} window closed, cleaning up`);
            const appData = runningApps.get(appName);
            if (appData && appData.process) {
              try {
                appData.process.kill();
              } catch (err) {
                console.error(`Error killing ${appName} process:`, err);
              }
            }
            runningApps.delete(appName);
          });

          resolve({ success: true });
        }
      })
      .catch((err) => {
        console.error('[launch-app] Failed to start dev server for', appName, err);
        try {
          viteProcess.kill();
        } catch (_) {
          // ignore
        }
        resolve({ success: false, error: 'Failed to start dev server' });
      });
  });
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
