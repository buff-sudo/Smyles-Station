import type {AppModule} from '../AppModule.js';
import type {ModuleContext} from '../ModuleContext.js';
import {app, ipcMain, BrowserWindow} from 'electron';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import type {BlockNotAllowedOrigins} from './BlockNotAllowdOrigins.js';
import type {WhitelistedSite} from '../types/WhitelistedSite.js';
import {DefaultIcons} from '../utils/DefaultIcons.js';
import {UrlNormalizer} from '../utils/UrlNormalizer.js';

export interface AdminConfig {
  passwordHash: string;
  whitelistedSites: WhitelistedSite[]; // Changed from whitelistedUrls: string[]
  sessionTimeLimit: number; // in minutes, 0 = unlimited
  blockDevTools: boolean;
  blockTaskManager: boolean;
  enableHardwareAcceleration: boolean;
}

export class AdminModule implements AppModule {
  #configPath: string;
  #config: AdminConfig | null = null;
  #navigationBlocker: BlockNotAllowedOrigins | null = null;
  #rendererOrigin: string | null = null;

  constructor(navigationBlocker?: BlockNotAllowedOrigins, rendererOrigin?: string) {
    this.#configPath = path.join(app.getPath('userData'), 'admin-config.json');
    this.#navigationBlocker = navigationBlocker || null;
    this.#rendererOrigin = rendererOrigin || null;
  }

  /**
   * Reads the hardware acceleration setting from the admin config.
   * This is a static method that can be called early, before app.whenReady().
   * Returns true (enabled) by default if config doesn't exist or can't be read.
   */
  static async getHardwareAccelerationSetting(): Promise<boolean> {
    try {
      const configPath = path.join(app.getPath('userData'), 'admin-config.json');
      const data = await fs.readFile(configPath, 'utf-8');
      const config: AdminConfig = JSON.parse(data);
      return config.enableHardwareAcceleration ?? true; // Default to enabled
    } catch {
      // If config doesn't exist or can't be read, default to enabled
      return true;
    }
  }

  async enable(context: ModuleContext): Promise<void> {
    await this.#loadConfig();
    this.#setupIPCHandlers();
    this.#setupWindowHooks();
  }

  async #loadConfig(): Promise<void> {
    try {
      const data = await fs.readFile(this.#configPath, 'utf-8');
      this.#config = JSON.parse(data);

      // Validate structure - if old format, ignore it and use default
      if (!this.#config.whitelistedSites) {
        console.log('Old config format detected, creating new default config');
        this.#config = this.#createDefaultConfig();
        await this.#saveConfig();
      }
    } catch (error) {
      // If config doesn't exist, create default
      console.log('No config found, creating default config');
      this.#config = this.#createDefaultConfig();
      await this.#saveConfig();
    }

    // Update navigation blocker with loaded whitelist
    this.#updateNavigationBlocker();
  }

  #createDefaultConfig(): AdminConfig {
    return {
      passwordHash: this.#hashPassword('admin'),
      whitelistedSites: [
        {
          id: crypto.randomUUID(),
          url: 'https://pbskids.org/games',
          displayName: 'PBS Kids',
          iconUrl: DefaultIcons.getIconDataUrl('pbs_kids'),
          showOnSelectionScreen: true,
          displayOrder: 0,
          autoFetchedTitle: null,
          autoFetchedIconUrl: null,
          lastUpdated: Date.now(),
          createdAt: Date.now(),
        },
        {
          id: crypto.randomUUID(),
          url: 'https://www.abcmouse.com/library_account',
          displayName: 'ABC Mouse',
          iconUrl: DefaultIcons.getIconDataUrl('abcmouse'),
          showOnSelectionScreen: true,
          displayOrder: 1,
          autoFetchedTitle: null,
          autoFetchedIconUrl: null,
          lastUpdated: Date.now(),
          createdAt: Date.now(),
        }
      ],
      sessionTimeLimit: 0, // unlimited by default
      blockDevTools: true,
      blockTaskManager: true,
      enableHardwareAcceleration: true, // enabled by default for best performance
    };
  }

  #updateNavigationBlocker(): void {
    if (this.#navigationBlocker && this.#config) {
      const allowedOrigins = new Set(
        this.#config.whitelistedSites.map(site => {
          try {
            // Use normalized origin to allow both www and non-www
            return UrlNormalizer.normalizedOrigin(site.url);
          } catch {
            return site.url;
          }
        })
      );

      // Also add non-normalized origins to be safe
      this.#config.whitelistedSites.forEach(site => {
        try {
          allowedOrigins.add(new URL(site.url).origin);
        } catch {}
      });

      // Always include renderer origin if provided
      if (this.#rendererOrigin) {
        allowedOrigins.add(this.#rendererOrigin);
      }
      console.log(allowedOrigins);
      this.#navigationBlocker.updateAllowedOrigins(allowedOrigins);
    }
  }

  async #saveConfig(): Promise<void> {
    if (this.#config) {
      await fs.writeFile(this.#configPath, JSON.stringify(this.#config, null, 2), 'utf-8');
    }
  }

  #hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  #verifyPassword(password: string): boolean {
    if (!this.#config) return false;
    return this.#hashPassword(password) === this.#config.passwordHash;
  }

  #setupIPCHandlers(): void {
    // Admin authentication
    ipcMain.handle('admin:login', async (_event, password: string) => {
      return this.#verifyPassword(password);
    });

    // Get admin settings (without password hash)
    ipcMain.handle('admin:get-settings', async () => {
      if (!this.#config) return null;
      return {
        whitelistedUrls: this.#config.whitelistedSites.map(s => s.url), // For backward compatibility
        sessionTimeLimit: this.#config.sessionTimeLimit,
        blockDevTools: this.#config.blockDevTools,
        blockTaskManager: this.#config.blockTaskManager,
        enableHardwareAcceleration: this.#config.enableHardwareAcceleration,
      };
    });

    // Update whitelist (deprecated - kept for backward compatibility)
    // Note: This creates basic WhitelistedSite objects without metadata
    // New code should use admin:add-site, admin:update-site, admin:delete-site instead
    ipcMain.handle('admin:update-whitelist', async (_event, urls: string[]) => {
      if (this.#config) {
        // Convert URLs to WhitelistedSite objects
        this.#config.whitelistedSites = urls.map((url, index) => ({
          id: crypto.randomUUID(),
          url,
          displayName: null,
          iconUrl: null,
          showOnSelectionScreen: true,
          displayOrder: index,
          autoFetchedTitle: null,
          autoFetchedIconUrl: null,
          lastUpdated: Date.now(),
          createdAt: Date.now(),
        }));
        await this.#saveConfig();
        this.#updateNavigationBlocker();
        this.#broadcastSettingsChange();
        return true;
      }
      return false;
    });

    // Update session time limit
    ipcMain.handle('admin:update-time-limit', async (_event, minutes: number) => {
      if (this.#config) {
        this.#config.sessionTimeLimit = minutes;
        await this.#saveConfig();
        this.#broadcastSettingsChange();
        return true;
      }
      return false;
    });

    // Update security settings
    ipcMain.handle('admin:update-security', async (_event, settings: {blockDevTools: boolean, blockTaskManager: boolean}) => {
      if (this.#config) {
        this.#config.blockDevTools = settings.blockDevTools;
        this.#config.blockTaskManager = settings.blockTaskManager;
        await this.#saveConfig();

        // Apply settings to all existing windows
        BrowserWindow.getAllWindows().forEach(win => {
          this.#applySecuritySettings(win);
        });

        this.#broadcastSettingsChange();
        return true;
      }
      return false;
    });

    // Update hardware acceleration setting
    ipcMain.handle('admin:update-hardware-acceleration', async (_event, enable: boolean) => {
      if (this.#config) {
        this.#config.enableHardwareAcceleration = enable;
        await this.#saveConfig();
        this.#broadcastSettingsChange();
        // Note: Hardware acceleration change requires app restart to take effect
        return true;
      }
      return false;
    });

    // Change admin password
    ipcMain.handle('admin:change-password', async (_event, oldPassword: string, newPassword: string) => {
      if (this.#verifyPassword(oldPassword) && this.#config) {
        this.#config.passwordHash = this.#hashPassword(newPassword);
        await this.#saveConfig();
        return true;
      }
      return false;
    });

    // Check if URL is whitelisted
    ipcMain.handle('admin:is-url-whitelisted', async (_event, url: string) => {
      if (!this.#config) return false;
      try {
        // Use normalized origin comparison to handle www/non-www variants
        const normalizedOrigin = UrlNormalizer.normalizedOrigin(url);

        return this.#config.whitelistedSites.some(site => {
          const siteOrigin = UrlNormalizer.normalizedOrigin(site.url);
          return normalizedOrigin === siteOrigin || url.startsWith(site.url);
        });
      } catch {
        return false;
      }
    });

    // === New Site Management Handlers ===

    // Get all sites with metadata
    ipcMain.handle('admin:get-sites', async () => {
      if (!this.#config) return [];
      return this.#config.whitelistedSites;
    });

    // Add new site (auto-fetches metadata)
    ipcMain.handle('admin:add-site', async (_event, url: string) => {
      if (!this.#config) return null;

      try {
        // Normalize URL (remove www. subdomain if present)
        const normalizedUrl = UrlNormalizer.normalize(url);

        // Check for duplicates (including www/non-www variants)
        const isDuplicate = this.#config.whitelistedSites.some(site =>
          UrlNormalizer.areEquivalent(site.url, normalizedUrl)
        );

        if (isDuplicate) {
          console.warn(`Site already exists: ${normalizedUrl}`);
          return null;
        }

        // Import FaviconFetcher dynamically
        const {FaviconFetcher} = await import('../utils/FaviconFetcher.js');
        const metadata = await FaviconFetcher.fetchSiteMetadata(normalizedUrl);

        const newSite: WhitelistedSite = {
          id: crypto.randomUUID(),
          url: normalizedUrl, // Store normalized URL
          displayName: null,
          iconUrl: null,
          showOnSelectionScreen: true,
          displayOrder: this.#config.whitelistedSites.length,
          autoFetchedTitle: metadata.title,
          autoFetchedIconUrl: metadata.iconUrl,
          lastUpdated: Date.now(),
          createdAt: Date.now(),
        };

        this.#config.whitelistedSites.push(newSite);
        await this.#saveConfig();
        this.#updateNavigationBlocker();
        this.#broadcastSettingsChange();

        return newSite;
      } catch (error) {
        console.error('Failed to add site:', error);
        return null;
      }
    });

    // Update site (for custom name, icon, visibility)
    ipcMain.handle('admin:update-site', async (_event, siteId: string, updates: Partial<WhitelistedSite>) => {
      if (!this.#config) return false;

      const site = this.#config.whitelistedSites.find(s => s.id === siteId);
      if (!site) return false;

      Object.assign(site, updates, {lastUpdated: Date.now()});
      await this.#saveConfig();
      this.#updateNavigationBlocker();
      this.#broadcastSettingsChange();

      return true;
    });

    // Delete site
    ipcMain.handle('admin:delete-site', async (_event, siteId: string) => {
      if (!this.#config) return false;

      this.#config.whitelistedSites = this.#config.whitelistedSites.filter(s => s.id !== siteId);

      // Reorder remaining sites
      this.#config.whitelistedSites.forEach((site, index) => {
        site.displayOrder = index;
      });

      await this.#saveConfig();
      this.#updateNavigationBlocker();
      this.#broadcastSettingsChange();

      return true;
    });

    // Reorder sites (accepts array of IDs in new order)
    ipcMain.handle('admin:reorder-sites', async (_event, siteIds: string[]) => {
      if (!this.#config) return false;

      const reordered: WhitelistedSite[] = [];

      for (let i = 0; i < siteIds.length; i++) {
        const site = this.#config.whitelistedSites.find(s => s.id === siteIds[i]);
        if (site) {
          site.displayOrder = i;
          reordered.push(site);
        }
      }

      this.#config.whitelistedSites = reordered;
      await this.#saveConfig();
      this.#broadcastSettingsChange();

      return true;
    });

    // Refresh metadata (re-fetch title and icon)
    ipcMain.handle('admin:refresh-site-metadata', async (_event, siteId: string) => {
      if (!this.#config) return false;

      const site = this.#config.whitelistedSites.find(s => s.id === siteId);
      if (!site) return false;

      try {
        const {FaviconFetcher} = await import('../utils/FaviconFetcher.js');
        const metadata = await FaviconFetcher.fetchSiteMetadata(site.url);

        site.autoFetchedTitle = metadata.title;
        site.autoFetchedIconUrl = metadata.iconUrl;
        site.lastUpdated = Date.now();

        await this.#saveConfig();
        this.#broadcastSettingsChange();

        return true;
      } catch (error) {
        console.error('Failed to refresh metadata:', error);
        return false;
      }
    });
  }

  // Public method for other modules to access settings
  getSettings() {
    if (!this.#config) return null;
    return {
      whitelistedUrls: this.#config.whitelistedSites.map(s => s.url), // For backward compatibility
      sessionTimeLimit: this.#config.sessionTimeLimit,
      blockDevTools: this.#config.blockDevTools,
      blockTaskManager: this.#config.blockTaskManager,
      enableHardwareAcceleration: this.#config.enableHardwareAcceleration,
    };
  }

  #setupWindowHooks(): void {
    app.on('browser-window-created', (_event, window) => {
      this.#applySecuritySettings(window);
    });

    app.on('browser-window-focus', (_event, window) => {
      // Reapply security settings when window gains focus
      this.#applySecuritySettings(window);
    });
  }

  #broadcastSettingsChange(): void {
    const settings = this.getSettings();
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) {
        win.webContents.send('admin:settings-changed', settings);
      }
    });
  }

  #applySecuritySettings(window: BrowserWindow): void {
    if (!this.#config) return;

    // Block keyboard shortcuts
    window.webContents.on('before-input-event', (event, input) => {
      if (!this.#config) return;

      // Block DevTools shortcuts
      if (this.#config.blockDevTools) {
        const isDevToolsShortcut =
          // F12
          (input.key === 'F12') ||
          // Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac)
          (input.control && input.shift && input.key === 'I') ||
          (input.meta && input.alt && input.key === 'I') ||
          // Ctrl+Shift+J (Windows/Linux) or Cmd+Option+J (Mac)
          (input.control && input.shift && input.key === 'J') ||
          (input.meta && input.alt && input.key === 'J') ||
          // Ctrl+Shift+C (Windows/Linux) or Cmd+Option+C (Mac)
          (input.control && input.shift && input.key === 'C') ||
          (input.meta && input.alt && input.key === 'C');

        if (isDevToolsShortcut) {
          event.preventDefault();
        }
      }

      // Block Task Manager shortcuts
      if (this.#config.blockTaskManager) {
        const isTaskManagerShortcut =
          // Ctrl+Shift+Esc (Windows/Linux Task Manager)
          (input.control && input.shift && input.key === 'Escape') ||
          // Ctrl+Alt+Delete (Windows)
          (input.control && input.alt && input.key === 'Delete');

        if (isTaskManagerShortcut) {
          event.preventDefault();
        }
      }

      // Also block Alt+F4 and Ctrl+W to prevent closing
      const isCloseShortcut =
        (input.alt && input.key === 'F4') ||
        (input.control && input.key === 'W') ||
        (input.meta && input.key === 'W');

      if (isCloseShortcut) {
        event.preventDefault();
      }
    });

    // Disable right-click context menu (which has "Inspect" option)
    if (this.#config.blockDevTools) {
      window.webContents.on('context-menu', (event) => {
        event.preventDefault();
      });
    }
  }
}

export function createAdminModule(navigationBlocker?: BlockNotAllowedOrigins, rendererOrigin?: string): AdminModule {
  return new AdminModule(navigationBlocker, rendererOrigin);
}
