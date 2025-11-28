// Type definitions for Electron APIs exposed through contextBridge

export interface SessionStatus {
  isActive: boolean;
  timeRemaining: number; // milliseconds
  timeLimit: number; // minutes
  startTime: number | null;
}

declare global {
  interface Window {
    // Exposed functions from preload
    sha256sum: (data: string) => Promise<string>;
    versions: {
      node: string;
      chrome: string;
      electron: string;
    };
    send: (channel: string, message: string) => Promise<unknown>;
    openNewWindow: (url: string) => Promise<number>;
    closeCurrentWindow: () => Promise<void>;

    // Admin functions
    adminLogin: (password: string) => Promise<boolean>;
    adminGetSettings: () => Promise<{
      whitelistedUrls: string[];
      sessionTimeLimit: number;
      blockDevTools: boolean;
      blockTaskManager: boolean;
      enableHardwareAcceleration: boolean;
    } | null>;
    adminUpdateWhitelist: (urls: string[]) => Promise<boolean>;
    adminUpdateTimeLimit: (minutes: number) => Promise<boolean>;
    adminUpdateSecurity: (settings: {blockDevTools: boolean, blockTaskManager: boolean}) => Promise<boolean>;
    adminUpdateHardwareAcceleration: (enable: boolean) => Promise<boolean>;
    adminChangePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
    adminIsUrlWhitelisted: (url: string) => Promise<boolean>;

    // Session functions
    sessionStart: () => Promise<boolean>;
    sessionEnd: () => Promise<boolean>;
    sessionGetStatus: () => Promise<SessionStatus>;
    sessionIsActive: () => Promise<boolean>;
    sessionOnStatus: (callback: (status: SessionStatus) => void) => void;
    sessionOnWarning: (callback: () => void) => void;
    sessionOnExpired: (callback: () => void) => void;
  }
}

export {};