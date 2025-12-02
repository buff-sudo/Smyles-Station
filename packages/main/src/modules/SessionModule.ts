import type {ModuleContext} from '../ModuleContext.js';
import type {AdminFeature} from '../AdminFeature.js';
import {ipcMain, BrowserWindow} from 'electron';
import type {AdminModule} from './AdminModule.js';

export interface SessionStatus {
  isActive: boolean;
  timeRemaining: number; // milliseconds
  timeLimit: number; // minutes
  startTime: number | null;
}

interface GlobalSessionState {
  isActive: boolean;
  startTime: number | null;
  timeLimit: number; // in minutes
  warningShown: boolean;
  sessionTimer: NodeJS.Timeout | null;
  warningTimer: NodeJS.Timeout | null;
  statusBroadcastInterval: NodeJS.Timeout | null;
}

export class SessionModule implements AdminFeature {
  readonly featureName = 'session-manager';
  readonly description = 'Manages timed sessions with automatic expiration and warnings';

  #adminModule: AdminModule;
  #mainWindowId: number | null = null;
  #state: GlobalSessionState = {
    isActive: false,
    startTime: null,
    timeLimit: 0,
    warningShown: false,
    sessionTimer: null,
    warningTimer: null,
    statusBroadcastInterval: null,
  };

  constructor(adminModule: AdminModule) {
    this.#adminModule = adminModule;
  }

  async enable(context: ModuleContext): Promise<void> {
    this.#setupIPCHandlers();

    // Track the first window created (this is the main window)
    context.app.on('browser-window-created', (_event, window) => {
      if (this.#mainWindowId === null) {
        this.#mainWindowId = window.id;
        console.log(`Main window ID set to: ${this.#mainWindowId}`);
      }
    });
  }

  #setupIPCHandlers(): void {
    // Start a new session
    ipcMain.handle('session:start', async () => {
      // Get session time limit from admin config
      const settings = await this.#adminModule.getSettings();
      const timeLimit = settings?.sessionTimeLimit ?? 0;
      this.startSession(timeLimit);
      return true;
    });

    // End session manually
    ipcMain.handle('session:end', async () => {
      this.endSession();
      return true;
    });

    // Get current session status
    ipcMain.handle('session:get-status', async () => {
      return this.getSessionStatus();
    });

    // Check if session is active
    ipcMain.handle('session:is-active', async () => {
      return this.#state.isActive;
    });
  }

  startSession(timeLimit: number): void {
    // Don't start if session already active
    if (this.#state.isActive) return;

    this.#state.isActive = true;
    this.#state.startTime = Date.now();
    this.#state.timeLimit = timeLimit;
    this.#state.warningShown = false;

    // Only setup timers if not unlimited (timeLimit > 0)
    if (timeLimit > 0) {
      this.#setupTimers();
    }
    this.#startStatusBroadcast();

    const timeDescription = timeLimit === 0 ? 'unlimited' : `${timeLimit} minutes`;
    console.log(`Session started: ${timeDescription}`);
  }

  endSession(): void {
    if (!this.#state.isActive) return;

    // Clear all timers
    this.#clearTimers();

    // Close all windows except the main window
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach(win => {
      // Only close child windows, not the main window
      // Main window is identified by its stored ID
      if (win.id !== this.#mainWindowId && !win.isDestroyed()) {
        console.log(`Closing child window ${win.id}`);
        win.close();
      }
    });

    // Reset state
    this.#state.isActive = false;
    this.#state.startTime = null;
    this.#state.warningShown = false;

    console.log('Session ended manually');
  }

  getSessionStatus(): SessionStatus {
    if (!this.#state.isActive || !this.#state.startTime) {
      return {
        isActive: false,
        timeRemaining: 0,
        timeLimit: 0,
        startTime: null,
      };
    }

    const elapsed = Date.now() - this.#state.startTime;
    const totalTime = this.#state.timeLimit * 60 * 1000;
    const remaining = Math.max(0, totalTime - elapsed);

    return {
      isActive: true,
      timeRemaining: remaining,
      timeLimit: this.#state.timeLimit,
      startTime: this.#state.startTime,
    };
  }

  #setupTimers(): void {
    if (!this.#state.isActive || !this.#state.startTime) return;

    const timeLimit = this.#state.timeLimit * 60 * 1000; // convert to milliseconds

    // Setup main expiration timer
    this.#state.sessionTimer = setTimeout(() => {
      this.#handleSessionExpiry();
    }, timeLimit);

    // Setup warning timer (1 minute before expiration)
    // Only if session is longer than 1 minute
    if (this.#state.timeLimit > 1) {
      const warningTime = timeLimit - 60 * 1000; // 1 minute before
      this.#state.warningTimer = setTimeout(() => {
        this.#handleWarning();
      }, warningTime);
    }
  }

  #startStatusBroadcast(): void {
    // Broadcast status update every second to all windows
    this.#state.statusBroadcastInterval = setInterval(() => {
      if (!this.#state.isActive) {
        this.#stopStatusBroadcast();
        return;
      }

      const status = this.getSessionStatus();
      this.#broadcastToAllWindows('session:status-update', status);
    }, 1000);
  }

  #stopStatusBroadcast(): void {
    if (this.#state.statusBroadcastInterval) {
      clearInterval(this.#state.statusBroadcastInterval);
      this.#state.statusBroadcastInterval = null;
    }
  }

  #handleWarning(): void {
    if (this.#state.warningShown) return;

    this.#state.warningShown = true;
    this.#broadcastToAllWindows('session:warning');
    console.log('Session warning: 1 minute remaining');
  }

  async #handleSessionExpiry(): Promise<void> {
    console.log('Session expired');

    // Broadcast expiry event to all windows BEFORE closing them
    this.#broadcastToAllWindows('session:expired');

    // Give a brief moment for the event to be received
    setTimeout(async () => {
      const allWindows = BrowserWindow.getAllWindows();
      const mainWindow = allWindows.find(win => win.id === this.#mainWindowId && !win.isDestroyed());

      console.log(`Session expired - Total windows: ${allWindows.length}, Main window ID: ${this.#mainWindowId}`);

      if (!mainWindow) {
        console.error('Main window not found during session expiry!');
        return;
      }

      // Step 1: Close all child windows
      allWindows.forEach(win => {
        if (win.id !== this.#mainWindowId && !win.isDestroyed()) {
          console.log(`Closing child window ${win.id}`);
          win.close();
        }
      });

      // Step 2: Clear all browser data from the main window
      console.log('Clearing browser data (cookies, cache, storage)...');
      try {
        const session = mainWindow.webContents.session;

        // Clear cache
        await session.clearCache();

        // Clear storage data (cookies, localStorage, etc.)
        await session.clearStorageData({
          storages: ['cookies', 'localstorage', 'indexdb', 'websql', 'serviceworkers', 'cachestorage'],
        });

        console.log('Browser data cleared successfully');
      } catch (error) {
        console.error('Error clearing browser data:', error);
      }

      // Step 3: Clear timers and reset state
      this.#clearTimers();
      this.#state.isActive = false;
      this.#state.startTime = null;
      this.#state.warningShown = false;

      // Step 4: Reload the main window to return to initial screen
      console.log('Reloading main window to return to initial screen...');
      mainWindow.reload();
    }, 100);
  }

  #clearTimers(): void {
    if (this.#state.sessionTimer) {
      clearTimeout(this.#state.sessionTimer);
      this.#state.sessionTimer = null;
    }
    if (this.#state.warningTimer) {
      clearTimeout(this.#state.warningTimer);
      this.#state.warningTimer = null;
    }
    this.#stopStatusBroadcast();
  }

  #broadcastToAllWindows(channel: string, ...args: any[]): void {
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) {
        win.webContents.send(channel, ...args);
      }
    });
  }

  // Method to update time limit (called when admin changes config)
  updateTimeLimit(minutes: number): void {
    // This will apply to the next session, not the current one
    console.log(`Time limit updated to ${minutes} minutes (applies to next session)`);
  }
}

export function createSessionModule(adminModule: AdminModule): SessionModule {
  return new SessionModule(adminModule);
}
