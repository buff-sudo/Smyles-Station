import type {AdminFeature} from '../AdminFeature.js';
import type {ModuleContext} from '../ModuleContext.js';
import type {AdminModule, ShutdownSchedule, DaySchedule} from './AdminModule.js';
import {ipcMain, BrowserWindow} from 'electron';
import {exec} from 'node:child_process';
import {promisify} from 'node:util';

const execAsync = promisify(exec);

interface ShutdownState {
  nextShutdownTime: number | null; // Unix timestamp (ms)
  warningShown: boolean;
  shutdownTimer: NodeJS.Timeout | null;
  warningTimer: NodeJS.Timeout | null;
  checkInterval: NodeJS.Timeout | null;
}

export class ShutdownScheduleModule implements AdminFeature {
  readonly featureName = 'shutdown-scheduler';
  readonly description = 'Schedules automatic system shutdowns by day of week';

  #adminModule: AdminModule;
  #state: ShutdownState;
  #WARNING_MINUTES = 10;
  #CHECK_INTERVAL_MS = 60000; // Check every minute
  #dryRunMode: boolean;

  constructor(adminModule: AdminModule, options?: {dryRun?: boolean}) {
    this.#adminModule = adminModule;
    this.#dryRunMode = options?.dryRun ?? false;
    this.#state = {
      nextShutdownTime: null,
      warningShown: false,
      shutdownTimer: null,
      warningTimer: null,
      checkInterval: null,
    };

    if (this.#dryRunMode) {
      console.log('[ShutdownScheduler] Running in DRY-RUN mode - will not actually shutdown');
    }
  }

  async enable(context: ModuleContext): Promise<void> {
    this.#setupIPCHandlers();
    this.#startScheduleChecker();
  }

  async disable(): Promise<void> {
    this.#clearAllTimers();
  }

  /**
   * Start the schedule checker that runs every minute
   */
  #startScheduleChecker(): void {
    // Check immediately on startup
    this.#checkSchedule();

    // Then check every minute
    this.#state.checkInterval = setInterval(() => {
      this.#checkSchedule();
    }, this.#CHECK_INTERVAL_MS);
  }

  /**
   * Check the schedule and setup timers if needed
   */
  #checkSchedule(): void {
    const settings = this.#adminModule.getSettings();
    if (!settings?.shutdownSchedule) return;

    const nextShutdown = this.#calculateNextShutdown(settings.shutdownSchedule);

    if (!nextShutdown) {
      // No shutdown scheduled, clear existing timers
      this.#clearShutdownTimers();
      return;
    }

    // If next shutdown time changed, reset timers
    if (nextShutdown !== this.#state.nextShutdownTime) {
      this.#state.nextShutdownTime = nextShutdown;
      this.#state.warningShown = false;
      this.#setupShutdownTimers(nextShutdown);
    }
  }

  /**
   * Calculate the next shutdown time based on the schedule
   * @param schedule The shutdown schedule configuration
   * @returns Unix timestamp (ms) of next shutdown, or null if none scheduled
   */
  #calculateNextShutdown(schedule: ShutdownSchedule): number | null {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    const dayNames: (keyof ShutdownSchedule)[] = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];

    // Check today first (if time hasn't passed)
    const todayConfig = schedule[dayNames[currentDay]];
    if (todayConfig.enabled) {
      const todayShutdown = this.#parseTimeToday(todayConfig.time);
      if (todayShutdown > now.getTime()) {
        return todayShutdown;
      }
    }

    // Check next 7 days
    for (let i = 1; i <= 7; i++) {
      const checkDay = (currentDay + i) % 7;
      const dayConfig = schedule[dayNames[checkDay]];

      if (dayConfig.enabled) {
        return this.#parseTimeFutureDay(dayConfig.time, i);
      }
    }

    return null; // No shutdown scheduled in next 7 days
  }

  /**
   * Parse time string to today's timestamp
   * @param time Time in HH:MM format
   * @returns Unix timestamp (ms)
   */
  #parseTimeToday(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    return target.getTime();
  }

  /**
   * Parse time string to a future day's timestamp
   * @param time Time in HH:MM format
   * @param daysAhead Number of days ahead
   * @returns Unix timestamp (ms)
   */
  #parseTimeFutureDay(time: string, daysAhead: number): number {
    const [hours, minutes] = time.split(':').map(Number);
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);
    target.setHours(hours, minutes, 0, 0);
    return target.getTime();
  }

  /**
   * Setup shutdown and warning timers
   * @param shutdownTime Unix timestamp (ms) when shutdown should occur
   */
  #setupShutdownTimers(shutdownTime: number): void {
    this.#clearShutdownTimers();

    const now = Date.now();
    const timeUntilShutdown = shutdownTime - now;
    const warningTime = this.#WARNING_MINUTES * 60 * 1000;

    // Setup shutdown timer
    this.#state.shutdownTimer = setTimeout(() => {
      this.#executeShutdown();
    }, timeUntilShutdown);

    // Setup warning timer (10 minutes before)
    if (timeUntilShutdown > warningTime) {
      this.#state.warningTimer = setTimeout(() => {
        this.#showWarning();
      }, timeUntilShutdown - warningTime);
    } else if (timeUntilShutdown > 0 && !this.#state.warningShown) {
      // Less than 10 minutes until shutdown, show warning immediately
      this.#showWarning();
    }

    console.log(
      `[ShutdownScheduler] Next shutdown scheduled for ${new Date(shutdownTime).toLocaleString()}`
    );
  }

  /**
   * Show warning to all windows
   */
  #showWarning(): void {
    if (this.#state.warningShown) return;

    this.#state.warningShown = true;

    const remaining = this.#state.nextShutdownTime ? this.#state.nextShutdownTime - Date.now() : 0;

    this.#broadcastToAllWindows('shutdown:warning', {
      shutdownTime: this.#state.nextShutdownTime,
      timeRemaining: remaining,
    });

    console.log(`[ShutdownScheduler] Warning: ${this.#WARNING_MINUTES} minutes until shutdown`);
  }

  /**
   * Execute the system shutdown
   */
  async #executeShutdown(): Promise<void> {
    console.log('[ShutdownScheduler] Executing scheduled system shutdown...');

    // Broadcast imminent shutdown event
    this.#broadcastToAllWindows('shutdown:imminent');

    // Brief delay for event delivery
    setTimeout(async () => {
      try {
        await this.#shutdownSystem();
      } catch (error) {
        console.error('[ShutdownScheduler] Failed to shutdown system:', error);
        this.#broadcastToAllWindows('shutdown:failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }, 2000); // 2-second warning
  }

  /**
   * Execute platform-specific shutdown command
   */
  async #shutdownSystem(): Promise<void> {
    const platform = process.platform;

    if (this.#dryRunMode) {
      console.log(`[ShutdownScheduler] [DRY RUN] Would execute shutdown on platform: ${platform}`);
      this.#broadcastToAllWindows('shutdown:dry-run');
      return;
    }

    let command: string;

    if (platform === 'win32') {
      // Windows: shutdown command with 0 second delay
      command = 'shutdown /s /t 0';
    } else if (platform === 'linux') {
      // Linux: Multiple fallback options
      // Try systemctl first (systemd), then shutdown command
      command = 'systemctl poweroff || shutdown -h now';
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    console.log(`[ShutdownScheduler] Executing shutdown command: ${command}`);
    await execAsync(command);
  }

  /**
   * Clear all shutdown and warning timers
   */
  #clearShutdownTimers(): void {
    if (this.#state.shutdownTimer) {
      clearTimeout(this.#state.shutdownTimer);
      this.#state.shutdownTimer = null;
    }
    if (this.#state.warningTimer) {
      clearTimeout(this.#state.warningTimer);
      this.#state.warningTimer = null;
    }
    this.#state.nextShutdownTime = null;
    this.#state.warningShown = false;
  }

  /**
   * Clear all timers including check interval
   */
  #clearAllTimers(): void {
    this.#clearShutdownTimers();
    if (this.#state.checkInterval) {
      clearInterval(this.#state.checkInterval);
      this.#state.checkInterval = null;
    }
  }

  /**
   * Broadcast event to all windows
   */
  #broadcastToAllWindows(channel: string, data?: unknown): void {
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) {
        win.webContents.send(channel, data);
      }
    });
  }

  /**
   * Validate shutdown schedule format
   */
  #validateSchedule(schedule: ShutdownSchedule): boolean {
    const days: (keyof ShutdownSchedule)[] = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];

    for (const day of days) {
      const config = schedule[day];

      if (typeof config.enabled !== 'boolean') {
        return false;
      }

      if (typeof config.time !== 'string') {
        return false;
      }

      // Validate HH:MM format
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(config.time)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Setup IPC handlers for shutdown schedule
   */
  #setupIPCHandlers(): void {
    ipcMain.handle('shutdown:update-schedule', async (_event, schedule: ShutdownSchedule) => {
      // Validate schedule
      if (!this.#validateSchedule(schedule)) {
        console.error('[ShutdownScheduler] Invalid schedule format');
        return false;
      }

      // Update via AdminModule (which saves to disk)
      const success = await this.#adminModule.updateShutdownSchedule(schedule);

      if (success) {
        // Recalculate shutdown times
        this.#checkSchedule();
      }

      return success;
    });

    ipcMain.handle('shutdown:get-next-shutdown', async () => {
      return {
        nextShutdownTime: this.#state.nextShutdownTime,
        timeRemaining: this.#state.nextShutdownTime
          ? this.#state.nextShutdownTime - Date.now()
          : null,
      };
    });
  }
}

export function createShutdownScheduleModule(
  adminModule: AdminModule
): ShutdownScheduleModule {
  // Check for dry-run mode via environment variable
  const dryRun = process.env.SHUTDOWN_DRY_RUN === 'true';
  return new ShutdownScheduleModule(adminModule, {dryRun});
}
