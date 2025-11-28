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
        kiosk: true,
        show: false,
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
        this.#injectSessionTimer(newWindow);
      });

      this.#injectExitButton(newWindow);
      this.#injectSessionTimer(newWindow);

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

  #injectSessionTimer(window: BrowserWindow): void {
    const timerCode = `
      (function() {
        function createSessionTimer() {
          // Check if timer already exists
          if (document.getElementById('electron-session-timer')) {
            return;
          }

          if (!document.body) {
            return;
          }

          // Create session timer container
          const timerContainer = document.createElement('div');
          timerContainer.id = 'electron-session-timer';
          timerContainer.style.cssText = \`
            position: fixed;
            top: 20px;
            left: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 2147483646;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            display: none;
            transition: background 0.3s;
          \`;

          // Create timer content
          const timerLabel = document.createElement('div');
          timerLabel.style.cssText = \`
            font-size: 11px;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
            margin-bottom: 2px;
          \`;
          timerLabel.textContent = 'Time Remaining';

          const timerValue = document.createElement('div');
          timerValue.id = 'electron-session-timer-value';
          timerValue.style.cssText = \`
            font-size: 20px;
            font-weight: 700;
            font-family: 'Courier New', monospace;
            letter-spacing: 1px;
          \`;
          timerValue.textContent = '00:00';

          timerContainer.appendChild(timerLabel);
          timerContainer.appendChild(timerValue);
          document.body.appendChild(timerContainer);

          // Listen for session status updates
          if (window.sessionOnStatus) {
            window.sessionOnStatus((status) => {
              if (status.isActive && status.timeRemaining > 0) {
                timerContainer.style.display = 'block';

                // Format time
                const totalSeconds = Math.floor(status.timeRemaining / 1000);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                timerValue.textContent =
                  String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');

                // Change to warning color if less than 1 minute
                if (status.timeRemaining < 60000) {
                  timerContainer.style.background = 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
                } else {
                  timerContainer.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                }
              } else {
                timerContainer.style.display = 'none';
              }
            });
          }

          // Listen for session warnings
          if (window.sessionOnWarning) {
            window.sessionOnWarning(() => {
              // Flash the timer
              timerContainer.style.animation = 'pulse 0.5s ease-in-out 3';
            });
          }

          // Listen for session expiry
          if (window.sessionOnExpired) {
            window.sessionOnExpired(() => {
              timerContainer.style.display = 'none';
            });
          }
        }

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', createSessionTimer);
        } else {
          createSessionTimer();
        }
      })();
    `;

    window.webContents.executeJavaScript(timerCode).catch(err => {
      console.error('Failed to inject session timer:', err);
    });
  }
}

export function createNewWindowManagerModule(...args: ConstructorParameters<typeof NewWindowManager>) {
  return new NewWindowManager(...args);
}