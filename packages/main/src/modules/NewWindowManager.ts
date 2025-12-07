import type {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';
import {BrowserWindow, WebContentsView, ipcMain, screen} from 'electron';

export class NewWindowManager implements AppModule {
  #currentView: WebContentsView | null = null;
  #usageStats: import('./UsageStatsModule.js').UsageStatsModule | null = null;
  #currentGameUrl: string = '';
  #currentGameName: string = '';
  #isViewAttached: boolean = false;

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

      // Get window dimensions for WebContentsView bounds
      const [width, height] = mainWindow.getSize();
      const HEADER_HEIGHT = 80;

      // Create WebContentsView (no window-specific options needed)
      const gameView = new WebContentsView({
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
      mainWindow.contentView.addChildView(gameView);

      // Store reference and game info
      this.#currentView = gameView;
      this.#currentGameUrl = url;
      this.#currentGameName = siteName || url;
      this.#isViewAttached = true;

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

    // Hide game view (for showing dialogs on top)
    ipcMain.handle('hide-game-view', async (event) => {
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      if (!mainWindow || !this.#currentView || this.#currentView.webContents.isDestroyed()) {
        return;
      }

      // Only remove if currently attached
      if (this.#isViewAttached) {
        try {
          mainWindow.contentView.removeChildView(this.#currentView);
          this.#isViewAttached = false;
        } catch (error) {
          console.error('Error hiding game view:', error);
        }
      }
    });

    // Show game view (after closing dialogs)
    ipcMain.handle('show-game-view', async (event) => {
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      if (!mainWindow || !this.#currentView || this.#currentView.webContents.isDestroyed()) {
        return;
      }

      // Only add if not currently attached
      if (!this.#isViewAttached) {
        try {
          mainWindow.contentView.addChildView(this.#currentView);

          // Reset bounds to ensure proper positioning
          const [width, height] = mainWindow.getSize();
          const HEADER_HEIGHT = 80;
          this.#currentView.setBounds({
            x: 0,
            y: HEADER_HEIGHT,
            width: width,
            height: height - HEADER_HEIGHT,
          });

          this.#isViewAttached = true;
        } catch (error) {
          console.error('Error showing game view:', error);
        }
      }
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

    // Remove view from window if attached
    if (this.#isViewAttached) {
      try {
        mainWindow.contentView.removeChildView(this.#currentView);
        this.#isViewAttached = false;
      } catch (error) {
        console.error('Error removing game view:', error);
      }
    }

    // CRITICAL: Close webContents to free memory
    this.#currentView.webContents.close();

    // Clear references
    this.#currentView = null;
    this.#currentGameUrl = '';
    this.#currentGameName = '';
  }

  /**
   * Setup resize handler to update WebContentsView bounds when window resizes
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