/// <reference types="vite/client" />

interface ElectronAPI {
  launchApp: (appName: string) => Promise<{ success: boolean; error?: string }>;
  isAppRunning: (appName: string) => Promise<boolean>;
  getRunningApps: () => Promise<string[]>;
  closeApp: (appName: string) => Promise<{ success: boolean; error?: string }>;
  setAuthToken: (token: string) => void;
  getAuthToken: () => string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
