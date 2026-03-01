const { contextBridge, ipcRenderer } = require('electron');

let authToken = '';

contextBridge.exposeInMainWorld('electronAPI', {
  launchApp: (appName) => ipcRenderer.invoke('launch-app', appName),
  isAppRunning: (appName) => ipcRenderer.invoke('is-app-running', appName),
  focusApp: (appName) => ipcRenderer.invoke('focus-app', appName),
  getRunningApps: () => ipcRenderer.invoke('get-running-apps'),
  closeApp: (appName) => ipcRenderer.invoke('close-app', appName),
  setAuthToken: (token) => {
    authToken = token;
    console.log('[preload] Auth token set');
  },
  getAuthToken: () => authToken,
});
