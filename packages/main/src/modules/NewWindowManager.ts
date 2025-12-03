import type {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';
import {BrowserWindow, ipcMain, screen} from 'electron';
import type {AppInitConfig} from '../AppInitConfig.js';

class NewWindowManager implements AppModule {
  readonly #preload: {path: string};
  readonly #renderer: {path: string} | URL;
  #currentHeader: BrowserWindow | null = null;
  #currentContent: BrowserWindow | null = null;

  constructor({initConfig}: {initConfig: AppInitConfig}) {
    this.#preload = initConfig.preload;
    this.#renderer = initConfig.renderer;
  }

  async enable({app}: ModuleContext): Promise<void> {
    await app.whenReady();

    ipcMain.handle('open-new-window', async (event, url: string, siteName?: string) => {
      // Close any existing game first (single-game enforcement)
      if (this.#currentHeader && !this.#currentHeader.isDestroyed()) {
        this.#currentHeader.close();
      }
      if (this.#currentContent && !this.#currentContent.isDestroyed()) {
        this.#currentContent.close();
      }

      // Get the main window (parent) from the event sender
      const mainWindow = BrowserWindow.fromWebContents(event.sender);

      // Get screen dimensions
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.bounds;
      const HEADER_HEIGHT = 75;

      // Create header window
      const headerWindow = new BrowserWindow({
        parent: mainWindow || undefined,
        x: 0,
        y: 0,
        width: width,
        height: HEADER_HEIGHT,
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        skipTaskbar: true,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: false,
          preload: this.#preload.path,
        },
      });

      // Create content window (below header, child of header)
      const contentWindow = new BrowserWindow({
        parent: headerWindow,
        x: 0,
        y: HEADER_HEIGHT,
        width: width,
        height: height - HEADER_HEIGHT,
        frame: false,
        show: false,
        resizable: false,
        movable: false,
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

      // Store references
      this.#currentHeader = headerWindow;
      this.#currentContent = contentWindow;

      // Cleanup handlers - when either closes, close the other
      headerWindow.on('closed', () => {
        if (this.#currentContent && !this.#currentContent.isDestroyed()) {
          this.#currentContent.close();
        }
        this.#currentHeader = null;
      });

      contentWindow.on('closed', () => {
        if (this.#currentHeader && !this.#currentHeader.isDestroyed()) {
          this.#currentHeader.close();
        }
        this.#currentContent = null;
      });

      // Load header
      const rendererPath = this.#renderer instanceof URL
        ? this.#renderer.href
        : `file://${this.#renderer.path}`;
      const headerUrl = `${rendererPath}?header=true`;
      await headerWindow.loadURL(headerUrl);

      // Load website in content window
      await contentWindow.loadURL(url);

      // Additional safeguards for header window
      headerWindow.setAlwaysOnTop(true, 'screen-saver');
      headerWindow.setVisibleOnAllWorkspaces(true);

      // Show both windows
      headerWindow.show();
      contentWindow.show();

      return headerWindow.id;
    });

    ipcMain.handle('close-current-window', async (event) => {
      const senderWindow = BrowserWindow.fromWebContents(event.sender);

      // Check if this is being called from the main window (no game open)
      const isMainWindow = senderWindow &&
        (!this.#currentHeader || this.#currentHeader.isDestroyed()) &&
        (!this.#currentContent || this.#currentContent.isDestroyed());

      if (isMainWindow) {
        // Close the entire application
        const {app} = await import('electron');
        app.quit();
        return;
      }

      // Close both header and content windows (game is open)
      if (this.#currentContent && !this.#currentContent.isDestroyed()) {
        this.#currentContent.close();
      }
      if (this.#currentHeader && !this.#currentHeader.isDestroyed()) {
        this.#currentHeader.close();
      }

      // Clear references
      this.#currentHeader = null;
      this.#currentContent = null;

      // Focus main window (first non-destroyed window)
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