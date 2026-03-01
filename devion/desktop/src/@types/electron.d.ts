export {};

declare global {
  interface Window {
    electronAPI?: {
      launchApp: (appName: string) => Promise<{ success: boolean; error?: string }>;
      isAppRunning: (appName: string) => Promise<boolean>;
      focusApp: (appName: string) => Promise<{ success: boolean; error?: string }>;
      getRunningApps: () => Promise<string[]>;
      closeApp: (appName: string) => Promise<{ success: boolean; error?: string }>;
      setAuthToken: (token: string) => void;
      getAuthToken: () => string;
    };
  }
}
