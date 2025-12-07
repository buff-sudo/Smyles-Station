import {sha256sum} from './nodeCrypto.js';
import {versions} from './versions.js';
import {ipcRenderer} from 'electron';

function send(channel: string, message: string) {
  return ipcRenderer.invoke(channel, message);
}

function openNewWindow(url: string, siteName?: string) {
  return ipcRenderer.invoke('open-new-window', url, siteName);
}

function closeCurrentWindow() {
  return ipcRenderer.invoke('close-current-window');
}

// Admin functions
function adminLogin(password: string): Promise<boolean> {
  return ipcRenderer.invoke('admin:login', password);
}

function adminGetSettings(): Promise<{
  whitelistedUrls: string[];
  sessionTimeLimit: number;
  blockDevTools: boolean;
  blockTaskManager: boolean;
  autoStartOnBoot: boolean;
} | null> {
  return ipcRenderer.invoke('admin:get-settings');
}

function adminUpdateWhitelist(urls: string[]): Promise<boolean> {
  return ipcRenderer.invoke('admin:update-whitelist', urls);
}

function adminUpdateTimeLimit(minutes: number): Promise<boolean> {
  return ipcRenderer.invoke('admin:update-time-limit', minutes);
}

function adminUpdateSecurity(settings: {blockDevTools: boolean, blockTaskManager: boolean}): Promise<boolean> {
  return ipcRenderer.invoke('admin:update-security', settings);
}

function adminUpdateHardwareAcceleration(enable: boolean): Promise<boolean> {
  return ipcRenderer.invoke('admin:update-hardware-acceleration', enable);
}

function adminUpdateAutoStart(enabled: boolean): Promise<boolean> {
  return ipcRenderer.invoke('admin:update-auto-start', enabled);
}

function adminVerifyEmergencyExit(password: string): Promise<boolean> {
  return ipcRenderer.invoke('admin:verify-emergency-exit', password);
}

function adminChangePassword(oldPassword: string, newPassword: string): Promise<boolean> {
  return ipcRenderer.invoke('admin:change-password', oldPassword, newPassword);
}

function adminIsUrlWhitelisted(url: string): Promise<boolean> {
  return ipcRenderer.invoke('admin:is-url-whitelisted', url);
}

// Session functions
function sessionStart(): Promise<boolean> {
  return ipcRenderer.invoke('session:start');
}

function sessionEnd(): Promise<boolean> {
  return ipcRenderer.invoke('session:end');
}

function sessionGetStatus(): Promise<{
  isActive: boolean;
  timeRemaining: number;
  timeLimit: number;
  startTime: number | null;
}> {
  return ipcRenderer.invoke('session:get-status');
}

function sessionIsActive(): Promise<boolean> {
  return ipcRenderer.invoke('session:is-active');
}

// Session event listeners
function sessionOnStatus(callback: (status: {
  isActive: boolean;
  timeRemaining: number;
  timeLimit: number;
  startTime: number | null;
}) => void) {
  ipcRenderer.on('session:status-update', (_event, status) => callback(status));
}

function sessionOnWarning(callback: () => void) {
  ipcRenderer.on('session:warning', () => callback());
}

function sessionOnExpired(callback: () => void) {
  ipcRenderer.on('session:expired', () => callback());
}

// Admin event listeners
function adminOnSettingsChanged(callback: (settings: {
  whitelistedUrls: string[];
  sessionTimeLimit: number;
  blockDevTools: boolean;
  blockTaskManager: boolean;
  enableHardwareAcceleration: boolean;
  autoStartOnBoot: boolean;
}) => void) {
  ipcRenderer.on('admin:settings-changed', (_event, settings) => callback(settings));
}

function adminOnEmergencyExitRequested(callback: () => void): void {
  ipcRenderer.on('admin:emergency-exit-requested', () => callback());
}

// New Site Management Functions
function adminGetSites(): Promise<any[]> {
  return ipcRenderer.invoke('admin:get-sites');
}

function adminAddSite(url: string): Promise<any | null> {
  return ipcRenderer.invoke('admin:add-site', url);
}

function adminUpdateSite(siteId: string, updates: any): Promise<boolean> {
  return ipcRenderer.invoke('admin:update-site', siteId, updates);
}

function adminDeleteSite(siteId: string): Promise<boolean> {
  return ipcRenderer.invoke('admin:delete-site', siteId);
}

function adminReorderSites(siteIds: string[]): Promise<boolean> {
  return ipcRenderer.invoke('admin:reorder-sites', siteIds);
}

function adminRefreshSiteMetadata(siteId: string): Promise<boolean> {
  return ipcRenderer.invoke('admin:refresh-site-metadata', siteId);
}

// Usage Statistics
function statsDownloadCSV(): Promise<string> {
  return ipcRenderer.invoke('stats:download-csv');
}

function statsGetSummary(): Promise<{
  totalSessions: number;
  completedSessions: number;
  totalGames: number;
  completedGames: number;
  totalSessionTime: number;
  totalGameTime: number;
  averageSessionTime: number;
  averageGameTime: number;
}> {
  return ipcRenderer.invoke('stats:get-summary');
}

// Shutdown schedule functions
function adminUpdateShutdownSchedule(schedule: any): Promise<boolean> {
  return ipcRenderer.invoke('shutdown:update-schedule', schedule);
}

function shutdownGetNextShutdown(): Promise<{
  nextShutdownTime: number | null;
  timeRemaining: number | null;
}> {
  return ipcRenderer.invoke('shutdown:get-next-shutdown');
}

// Shutdown event listeners
function shutdownOnWarning(callback: (data: {shutdownTime: number; timeRemaining: number}) => void) {
  ipcRenderer.on('shutdown:warning', (_event, data) => callback(data));
}

function shutdownOnImminent(callback: () => void) {
  ipcRenderer.on('shutdown:imminent', () => callback());
}

function shutdownOnFailed(callback: (error: {error: string}) => void) {
  ipcRenderer.on('shutdown:failed', (_event, error) => callback(error));
}

function shutdownOnDryRun(callback: () => void) {
  ipcRenderer.on('shutdown:dry-run', () => callback());
}

export {
  sha256sum,
  versions,
  send,
  openNewWindow,
  closeCurrentWindow,
  adminLogin,
  adminGetSettings,
  adminUpdateWhitelist,
  adminUpdateTimeLimit,
  adminUpdateSecurity,
  adminUpdateHardwareAcceleration,
  adminUpdateAutoStart,
  adminVerifyEmergencyExit,
  adminChangePassword,
  adminIsUrlWhitelisted,
  sessionStart,
  sessionEnd,
  sessionGetStatus,
  sessionIsActive,
  sessionOnStatus,
  sessionOnWarning,
  sessionOnExpired,
  adminOnSettingsChanged,
  adminOnEmergencyExitRequested,
  adminGetSites,
  adminAddSite,
  adminUpdateSite,
  adminDeleteSite,
  adminReorderSites,
  adminRefreshSiteMetadata,
  statsDownloadCSV,
  statsGetSummary,
  adminUpdateShutdownSchedule,
  shutdownGetNextShutdown,
  shutdownOnWarning,
  shutdownOnImminent,
  shutdownOnFailed,
  shutdownOnDryRun,
};
