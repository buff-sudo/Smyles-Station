import {sha256sum} from './nodeCrypto.js';
import {versions} from './versions.js';
import {ipcRenderer} from 'electron';

function send(channel: string, message: string) {
  return ipcRenderer.invoke(channel, message);
}

function openNewWindow(url: string) {
  return ipcRenderer.invoke('open-new-window', url);
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
}) => void) {
  ipcRenderer.on('admin:settings-changed', (_event, settings) => callback(settings));
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
};
