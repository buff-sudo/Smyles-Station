import {sha256sum} from './nodeCrypto.js';
import {versions} from './versions.js';
import {ipcRenderer} from 'electron';

// Type definitions for complex objects
interface WhitelistedSite {
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

interface DaySchedule {
  enabled: boolean;
  time: string;
}

interface ShutdownSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

function send(channel: string, message: string) {
  return ipcRenderer.invoke(channel, message);
}

function openNewWindow(url: string, siteName?: string) {
  return ipcRenderer.invoke('open-new-window', url, siteName);
}

function closeCurrentWindow() {
  return ipcRenderer.invoke('close-current-window');
}

function hideGameView() {
  return ipcRenderer.invoke('hide-game-view');
}

function showGameView() {
  return ipcRenderer.invoke('show-game-view');
}

function windowFocus() {
  return ipcRenderer.invoke('window:focus');
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
  const handler = (_event: Electron.IpcRendererEvent, status: {isActive: boolean; timeRemaining: number; timeLimit: number; startTime: number | null}) => callback(status);
  ipcRenderer.on('session:status-update', handler);
  return () => ipcRenderer.removeListener('session:status-update', handler);
}

function sessionOnWarning(callback: () => void) {
  const handler = () => callback();
  ipcRenderer.on('session:warning', handler);
  return () => ipcRenderer.removeListener('session:warning', handler);
}

function sessionOnExpired(callback: () => void) {
  const handler = () => callback();
  ipcRenderer.on('session:expired', handler);
  return () => ipcRenderer.removeListener('session:expired', handler);
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
  const handler = (_event: Electron.IpcRendererEvent, settings: {whitelistedUrls: string[]; sessionTimeLimit: number; blockDevTools: boolean; blockTaskManager: boolean; enableHardwareAcceleration: boolean; autoStartOnBoot: boolean}) => callback(settings);
  ipcRenderer.on('admin:settings-changed', handler);
  return () => ipcRenderer.removeListener('admin:settings-changed', handler);
}

function adminOnEmergencyExitRequested(callback: () => void): () => void {
  const handler = () => callback();
  ipcRenderer.on('admin:emergency-exit-requested', handler);
  return () => ipcRenderer.removeListener('admin:emergency-exit-requested', handler);
}

// New Site Management Functions
function adminGetSites(): Promise<WhitelistedSite[]> {
  return ipcRenderer.invoke('admin:get-sites');
}

function adminAddSite(url: string): Promise<WhitelistedSite | null> {
  return ipcRenderer.invoke('admin:add-site', url);
}

function adminUpdateSite(siteId: string, updates: Partial<WhitelistedSite>): Promise<boolean> {
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

function statsDeleteAll(): Promise<boolean> {
  return ipcRenderer.invoke('stats:delete-all');
}

// Shutdown schedule functions
function adminUpdateShutdownSchedule(schedule: ShutdownSchedule): Promise<boolean> {
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
  hideGameView,
  showGameView,
  windowFocus,
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
  statsDeleteAll,
  adminUpdateShutdownSchedule,
  shutdownGetNextShutdown,
  shutdownOnWarning,
  shutdownOnImminent,
  shutdownOnFailed,
  shutdownOnDryRun,
};
