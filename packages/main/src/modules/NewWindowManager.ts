import type {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';
import {BrowserWindow, ipcMain, screen} from 'electron';
import type {AppInitConfig} from '../AppInitConfig.js';

class NewWindowManager implements AppModule {
  readonly #preload: {path: string};
  #currentContent: BrowserWindow | null = null;
  #usageStats: import('./UsageStatsModule.js').UsageStatsModule | null = null;
  #currentGameUrl: string = '';
  #currentGameName: string = '';

  constructor({initConfig, usageStats}: {initConfig: AppInitConfig, usageStats?: import('./UsageStatsModule.js').UsageStatsModule}) {
    this.#preload = initConfig.preload;
    this.#usageStats = usageStats || null;
  }

  async enable({app}: ModuleContext): Promise<void> {
    await app.whenReady();

    ipcMain.handle('open-new-window', async (event, url: string, siteName?: string) => {
      // Close any existing game first (single-game enforcement)
      if (this.#currentContent && !this.#currentContent.isDestroyed()) {
        this.#currentContent.close();
      }

      // Get the main window (parent) from the event sender
      const mainWindow = BrowserWindow.fromWebContents(event.sender);

      // Get screen dimensions
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.bounds;
      const HEADER_HEIGHT = 80; // Leave space for main window header

      // Create content window positioned below main window's header area
      const contentWindow = new BrowserWindow({
        parent: mainWindow || undefined,
        x: 0,
        y: HEADER_HEIGHT,
        width: width,
        height: height - HEADER_HEIGHT,
        frame: false,
        show: false,
        resizable: false,
        movable: false,
        alwaysOnTop: false, // Main window will be on top
        skipTaskbar: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true, // More secure, no preload needed
          webviewTag: false,
        },
      });

      // Block popups in content window
      contentWindow.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
      });

      // Store reference and game info
      this.#currentContent = contentWindow;
      this.#currentGameUrl = url;
      this.#currentGameName = siteName || url;

      // Cleanup handler
      contentWindow.on('closed', () => {
        // Record game end
        this.#usageStats?.recordGameEnd();
        this.#currentContent = null;
        this.#currentGameUrl = '';
        this.#currentGameName = '';
      });

      // Load website in content window
      await contentWindow.loadURL(url);

      // Show content window
      contentWindow.show();

      // Ensure main window is on top
      if (mainWindow) {
        mainWindow.setAlwaysOnTop(true, 'floating');
        mainWindow.focus();
      }

      // Record game start
      this.#usageStats?.recordGameStart(url, siteName || url);

      return contentWindow.id;
    });

    ipcMain.handle('close-current-window', async (event) => {
      const senderWindow = BrowserWindow.fromWebContents(event.sender);

      // Check if this is being called from the main window (no game open)
      const isMainWindow = senderWindow &&
        (!this.#currentContent || this.#currentContent.isDestroyed());

      if (isMainWindow) {
        // Close the entire application
        const {app} = await import('electron');
        app.quit();
        return;
      }

      // Close content window (game is open)
      if (this.#currentContent && !this.#currentContent.isDestroyed()) {
        this.#currentContent.close(); // Will trigger 'closed' event which records stats
      }

      // Clear references (also done in closed handler, but be explicit)
      this.#currentContent = null;
      this.#currentGameUrl = '';
      this.#currentGameName = '';

      // Focus main window
      const mainWindow = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
      if (mainWindow) {
        mainWindow.focus();
      }
    });
  }
}

export function createNewWindowManagerModule(...args: ConstructorParameters<typeof NewWindowManager>) {
  return new NewWindowManager(...args);
}