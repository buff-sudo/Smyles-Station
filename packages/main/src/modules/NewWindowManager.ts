import type {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';
import {BrowserWindow, BrowserView, ipcMain, screen} from 'electron';

class NewWindowManager implements AppModule {
  #currentView: BrowserView | null = null;
  #usageStats: import('./UsageStatsModule.js').UsageStatsModule | null = null;
  #currentGameUrl: string = '';
  #currentGameName: string = '';

  constructor({usageStats}: {usageStats?: import('./UsageStatsModule.js').UsageStatsModule}) {
    this.#usageStats = usageStats || null;
  }

  async enable({app}: ModuleContext): Promise<void> {
    await app.whenReady();

    // Setup resize handler for main window
    app.on('browser-window-created', (_event, window) => {
      this.#setupResizeHandler(window);
    });

    ipcMain.handle('open-new-window', async (event, url: string, siteName?: string) => {
      // Get main window from event sender
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      if (!mainWindow) {
        throw new Error('Main window not found');
      }

      // Close existing game if any (single-game enforcement)
      if (this.#currentView) {
        this.#closeCurrentGame(mainWindow);
      }

      // Get window dimensions for BrowserView bounds
      const [width, height] = mainWindow.getSize();
      const HEADER_HEIGHT = 80;

      // Create BrowserView (no window-specific options needed)
      const gameView = new BrowserView({
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
          webviewTag: false,
        },
      });

      // Block popups in game view
      gameView.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

      // Set bounds to position below header
      gameView.setBounds({
        x: 0,
        y: HEADER_HEIGHT,
        width: width,
        height: height - HEADER_HEIGHT,
      });

      // Add view to main window
      mainWindow.addBrowserView(gameView);

      // Store reference and game info
      this.#currentView = gameView;
      this.#currentGameUrl = url;
      this.#currentGameName = siteName || url;

      // Load game URL
      await gameView.webContents.loadURL(url);

      // Record game start
      this.#usageStats?.recordGameStart(url, siteName || url);

      // Return view ID for tracking (optional)
      return gameView.webContents.id;
    });

    ipcMain.handle('close-current-window', async (event) => {
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      if (!mainWindow) {
        throw new Error('Main window not found');
      }

      // Check if game is open
      if (!this.#currentView) {
        // No game open, user wants to quit the app
        const {app} = await import('electron');
        app.quit();
        return;
      }

      // Close the game
      this.#closeCurrentGame(mainWindow);
    });
  }

  /**
   * Close the currently open game (if any)
   * @param mainWindow - The main browser window
   */
  #closeCurrentGame(mainWindow: BrowserWindow): void {
    if (!this.#currentView) return;

    // Record game end BEFORE destroying
    this.#usageStats?.recordGameEnd();

    // Remove view from window
    mainWindow.removeBrowserView(this.#currentView);

    // CRITICAL: Destroy webContents to free memory
    this.#currentView.webContents.destroy();

    // Clear references
    this.#currentView = null;
    this.#currentGameUrl = '';
    this.#currentGameName = '';
  }

  /**
   * Setup resize handler to update BrowserView bounds when window resizes
   * @param window - The browser window to monitor
   */
  #setupResizeHandler(window: BrowserWindow): void {
    window.on('resize', () => {
      if (this.#currentView && !this.#currentView.webContents.isDestroyed()) {
        const [width, height] = window.getSize();
        const HEADER_HEIGHT = 80;
        this.#currentView.setBounds({
          x: 0,
          y: HEADER_HEIGHT,
          width: width,
          height: height - HEADER_HEIGHT,
        });
      }
    });
  }

  /**
   * Public method to close game if one is open
   * Called by SessionModule during session end/expiry
   */
  closeGameIfOpen(): void {
    const mainWindow = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
    if (mainWindow) {
      this.#closeCurrentGame(mainWindow);
    }
  }
}

export function createNewWindowManagerModule(...args: ConstructorParameters<typeof NewWindowManager>) {
  return new NewWindowManager(...args);
}