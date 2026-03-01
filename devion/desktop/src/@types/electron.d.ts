export {};

declare global {
  interface Window {
    electronAPI?: {
      launchApp: (appName: string) => Promise<{ success: boolean; error?: string }>;
    };
  }
}
