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

      // Inject exit button overlay after page loads
      newWindow.webContents.on('did-finish-load', () => {
        this.#injectExitButton(newWindow);
      });

      this.#injectExitButton(newWindow);

      return newWindow.id;
    });

    ipcMain.handle('close-current-window', async (event) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        window.close();
      }

      // Focus main window (first non-destroyed window)
      const mainWindow = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
      if (mainWindow) {
        mainWindow.focus();
      }
    });
  }

  #injectExitButton(window: BrowserWindow): void {
    const overlayCode = `
      (function() {
        function createExitButton() {
          // Check if button already exists
          if (document.getElementById('electron-exit-button')) {
            return;
          }

          if (!document.body) {
            return;
          }

          // Create exit button
          const exitButton = document.createElement('button');
          exitButton.id = 'electron-exit-button';
          exitButton.innerHTML = '✕';
          exitButton.style.cssText = \`
            position: fixed;
            top: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background-color: rgba(220, 38, 38, 0.9);
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 32px;
            font-weight: bold;
            cursor: pointer;
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            transition: all 0.2s ease;
            line-height: 1;
            padding: 0;
          \`;

          // Hover effect
          exitButton.addEventListener('mouseenter', () => {
            exitButton.style.backgroundColor = 'rgba(185, 28, 28, 0.95)';
            exitButton.style.transform = 'scale(1.1)';
          });

          exitButton.addEventListener('mouseleave', () => {
            exitButton.style.backgroundColor = 'rgba(220, 38, 38, 0.9)';
            exitButton.style.transform = 'scale(1)';
          });

          // Click handler
          exitButton.addEventListener('click', () => {
            if (window.closeCurrentWindow) {
              window.closeCurrentWindow();
            }
          });

          // Append to body
          document.body.appendChild(exitButton);
        }

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', createExitButton);
        } else {
          createExitButton();
        }
      })();
    `;

    window.webContents.executeJavaScript(overlayCode).catch(err => {
      console.error('Failed to inject exit button:', err);
    });
  }
}

export function createNewWindowManagerModule(...args: ConstructorParameters<typeof NewWindowManager>) {
  return new NewWindowManager(...args);
}