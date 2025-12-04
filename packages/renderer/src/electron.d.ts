// Type definitions for Electron APIs exposed through contextBridge

export interface SessionStatus {
  isActive: boolean;
  timeRemaining: number; // milliseconds
  timeLimit: number; // minutes
  startTime: number | null;
}

export interface WhitelistedSite {
  id: string;
  url: string;
  displayName: string | null;
  iconUrl: string | null;
  showOnSelectionScreen: boolean;
  displayOrder: number;
  autoFetchedTitle?: string;
  autoFetchedIconUrl?: string;
  lastUpdated: number;
  createdAt: number;
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
    openNewWindow: (url: string, siteName?: string) => Promise<number>;
    closeCurrentWindow: () => Promise<void>;

    // Admin functions
    adminLogin: (password: string) => Promise<boolean>;
    adminGetSettings: () => Promise<{
      whitelistedUrls: string[];
      sessionTimeLimit: number;
      blockDevTools: boolean;
      blockTaskManager: boolean;
      enableHardwareAcceleration: boolean;
      autoStartOnBoot: boolean;
    } | null>;
    adminUpdateWhitelist: (urls: string[]) => Promise<boolean>;
    adminUpdateTimeLimit: (minutes: number) => Promise<boolean>;
    adminUpdateSecurity: (settings: {blockDevTools: boolean, blockTaskManager: boolean}) => Promise<boolean>;
    adminUpdateHardwareAcceleration: (enable: boolean) => Promise<boolean>;
    adminUpdateAutoStart: (enabled: boolean) => Promise<boolean>;
    adminVerifyEmergencyExit: (password: string) => Promise<boolean>;
    adminChangePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
    adminIsUrlWhitelisted: (url: string) => Promise<boolean>;

    // Session functions
    sessionStart: () => Promise<boolean>;
    sessionEnd: () => Promise<boolean>;
    sessionGetStatus: () => Promise<SessionStatus>;
    sessionIsActive: () => Promise<boolean>;
    sessionOnStatus: (callback: (status: SessionStatus) => void) => () => void;
    sessionOnWarning: (callback: () => void) => () => void;
    sessionOnExpired: (callback: () => void) => () => void;

    // Admin event listeners
    adminOnSettingsChanged: (callback: (settings: {
      whitelistedUrls: string[];
      sessionTimeLimit: number;
      blockDevTools: boolean;
      blockTaskManager: boolean;
      enableHardwareAcceleration: boolean;
      autoStartOnBoot: boolean;
    }) => void) => () => void;
    adminOnEmergencyExitRequested: (callback: () => void) => () => void;

    // New site management functions
    adminGetSites: () => Promise<WhitelistedSite[]>;
    adminAddSite: (url: string) => Promise<WhitelistedSite | null>;
    adminUpdateSite: (siteId: string, updates: Partial<WhitelistedSite>) => Promise<boolean>;
    adminDeleteSite: (siteId: string) => Promise<boolean>;
    adminReorderSites: (siteIds: string[]) => Promise<boolean>;
    adminRefreshSiteMetadata: (siteId: string) => Promise<boolean>;

    // Usage statistics
    statsDownloadCSV: () => Promise<string>;
    statsGetSummary: () => Promise<{
      totalSessions: number;
      completedSessions: number;
      totalGames: number;
      completedGames: number;
      totalSessionTime: number;
      totalGameTime: number;
      averageSessionTime: number;
      averageGameTime: number;
    }>;
  }
}

export {};