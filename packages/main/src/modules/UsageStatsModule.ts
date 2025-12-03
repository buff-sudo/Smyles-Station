import type {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';
import {ipcMain, app} from 'electron';
import {writeFile, readFile, mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join} from 'node:path';

interface SessionRecord {
  sessionId: string;
  startTime: number;
  endTime: number | null;
  duration: number | null; // milliseconds
  timeLimit: number; // minutes
}

interface GameRecord {
  gameId: string;
  sessionId: string;
  url: string;
  siteName: string;
  startTime: number;
  endTime: number | null;
  duration: number | null; // milliseconds
}

interface UsageStats {
  sessions: SessionRecord[];
  games: GameRecord[];
}

export class UsageStatsModule implements AppModule {
  readonly #statsPath: string;
  #stats: UsageStats = {sessions: [], games: []};
  #currentSession: SessionRecord | null = null;
  #currentGame: GameRecord | null = null;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.#statsPath = join(userDataPath, 'usage-stats.json');
  }

  async enable({app}: ModuleContext): Promise<void> {
    await app.whenReady();

    // Load existing stats
    await this.#loadStats();

    // Download stats as CSV
    ipcMain.handle('stats:download-csv', async () => {
      return this.#generateCSV();
    });

    // Get stats summary
    ipcMain.handle('stats:get-summary', async () => {
      return this.#getSummary();
    });
  }

  // Public methods for other modules to call
  recordSessionStart(timeLimit: number): void {
    this.#recordSessionStart(timeLimit);
  }

  recordSessionEnd(): void {
    this.#recordSessionEnd();
  }

  recordGameStart(url: string, siteName: string): void {
    this.#recordGameStart(url, siteName);
  }

  recordGameEnd(): void {
    this.#recordGameEnd();
  }

  async #loadStats(): Promise<void> {
    try {
      if (existsSync(this.#statsPath)) {
        const data = await readFile(this.#statsPath, 'utf-8');
        this.#stats = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load usage stats:', error);
      this.#stats = {sessions: [], games: []};
    }
  }

  async #saveStats(): Promise<void> {
    try {
      const dir = join(app.getPath('userData'));
      if (!existsSync(dir)) {
        await mkdir(dir, {recursive: true});
      }
      await writeFile(this.#statsPath, JSON.stringify(this.#stats, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save usage stats:', error);
    }
  }

  #recordSessionStart(timeLimit: number): void {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.#currentSession = {
      sessionId,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      timeLimit,
    };
    this.#stats.sessions.push(this.#currentSession);
    this.#saveStats();
  }

  #recordSessionEnd(): void {
    if (this.#currentSession) {
      const endTime = Date.now();
      this.#currentSession.endTime = endTime;
      this.#currentSession.duration = endTime - this.#currentSession.startTime;
      this.#currentSession = null;
      this.#saveStats();
    }

    // Also end any open game
    this.#recordGameEnd();
  }

  #recordGameStart(url: string, siteName: string): void {
    if (!this.#currentSession) {
      console.warn('Game started without active session');
      return;
    }

    const gameId = `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.#currentGame = {
      gameId,
      sessionId: this.#currentSession.sessionId,
      url,
      siteName,
      startTime: Date.now(),
      endTime: null,
      duration: null,
    };
    this.#stats.games.push(this.#currentGame);
    this.#saveStats();
  }

  #recordGameEnd(): void {
    if (this.#currentGame) {
      const endTime = Date.now();
      this.#currentGame.endTime = endTime;
      this.#currentGame.duration = endTime - this.#currentGame.startTime;
      this.#currentGame = null;
      this.#saveStats();
    }
  }

  #generateCSV(): string {
    const lines: string[] = [];

    // Sessions CSV
    lines.push('=== SESSIONS ===');
    lines.push('Session ID,Start Time,End Time,Duration (minutes),Time Limit (minutes)');
    for (const session of this.#stats.sessions) {
      const startTime = new Date(session.startTime).toISOString();
      const endTime = session.endTime ? new Date(session.endTime).toISOString() : 'In Progress';
      const duration = session.duration ? (session.duration / 60000).toFixed(2) : 'N/A';
      lines.push(`${session.sessionId},${startTime},${endTime},${duration},${session.timeLimit}`);
    }

    lines.push('');
    lines.push('=== GAMES ===');
    lines.push('Game ID,Session ID,Site Name,URL,Start Time,End Time,Duration (minutes)');
    for (const game of this.#stats.games) {
      const startTime = new Date(game.startTime).toISOString();
      const endTime = game.endTime ? new Date(game.endTime).toISOString() : 'In Progress';
      const duration = game.duration ? (game.duration / 60000).toFixed(2) : 'N/A';
      const siteName = game.siteName.replace(/,/g, ';'); // Escape commas in site names
      const url = game.url.replace(/,/g, ';'); // Escape commas in URLs
      lines.push(`${game.gameId},${game.sessionId},${siteName},${url},${startTime},${endTime},${duration}`);
    }

    return lines.join('\n');
  }

  #getSummary() {
    const totalSessions = this.#stats.sessions.length;
    const completedSessions = this.#stats.sessions.filter(s => s.endTime !== null).length;
    const totalGames = this.#stats.games.length;
    const completedGames = this.#stats.games.filter(g => g.endTime !== null).length;

    const totalSessionTime = this.#stats.sessions
      .filter(s => s.duration !== null)
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    const totalGameTime = this.#stats.games
      .filter(g => g.duration !== null)
      .reduce((sum, g) => sum + (g.duration || 0), 0);

    return {
      totalSessions,
      completedSessions,
      totalGames,
      completedGames,
      totalSessionTime, // milliseconds
      totalGameTime, // milliseconds
      averageSessionTime: completedSessions > 0 ? Math.round(totalSessionTime / completedSessions) : 0,
      averageGameTime: completedGames > 0 ? Math.round(totalGameTime / completedGames) : 0,
    };
  }
}

export function createUsageStatsModule(): UsageStatsModule {
  return new UsageStatsModule();
}
