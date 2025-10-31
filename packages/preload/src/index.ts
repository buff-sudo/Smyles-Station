import {sha256sum} from './nodeCrypto.js';
import {versions} from './versions.js';
import {ipcRenderer} from 'electron';

function send(channel: string, message: string) {
  return ipcRenderer.invoke(channel, message);
}

function openNewWindow(url: string) {
  return ipcRenderer.invoke('open-new-window', url);
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

export {
  sha256sum,
  versions,
  send,
  openNewWindow,
  adminLogin,
  adminGetSettings,
  adminUpdateWhitelist,
  adminUpdateTimeLimit,
  adminUpdateSecurity,
  adminUpdateHardwareAcceleration,
  adminChangePassword,
  adminIsUrlWhitelisted,
};
