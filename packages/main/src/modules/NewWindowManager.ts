import type {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';
import {BrowserWindow, ipcMain} from 'electron';
import type {AppInitConfig} from '../AppInitConfig.js';

class NewWindowManager implements AppModule {
  readonly #preload: {path: string};

  constructor({initConfig}: {initConfig: AppInitConfig}) {
    this.#preload = initConfig.preload;
  }

  async enable({app}: ModuleContext): Promise<void> {
    await app.whenReady();

    ipcMain.handle('open-new-window', async (event, url: string) => {
      const newWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: false,
          webviewTag: false,
          preload: this.#preload.path,
        },
      });

      await newWindow.loadURL(url);
      newWindow.show();
      newWindow.maximize();

      return newWindow.id;
    });
  }
}

export function createNewWindowManagerModule(...args: ConstructorParameters<typeof NewWindowManager>) {
  return new NewWindowManager(...args);
}