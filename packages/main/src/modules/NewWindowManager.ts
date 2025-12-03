import type {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';
import {BrowserWindow, ipcMain, screen} from 'electron';
import type {AppInitConfig} from '../AppInitConfig.js';

class NewWindowManager implements AppModule {
  readonly #preload: {path: string};
  #currentContent: BrowserWindow | null = null;

  constructor({initConfig}: {initConfig: AppInitConfig}) {
    this.#preload = initConfig.preload;
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

      // Store reference
      this.#currentContent = contentWindow;

      // Cleanup handler
      contentWindow.on('closed', () => {
        this.#currentContent = null;
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
        this.#currentContent.close();
      }

      // Clear reference
      this.#currentContent = null;

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