import type {AppInitConfig} from './AppInitConfig.js';
import {createModuleRunner} from './ModuleRunner.js';
import {disallowMultipleAppInstance} from './modules/SingleInstanceApp.js';
import {createWindowManagerModule} from './modules/WindowManager.js';
import {createNewWindowManagerModule} from './modules/NewWindowManager.js';
import {terminateAppOnLastWindowClose} from './modules/ApplicationTerminatorOnLastWindowClose.js';
import {hardwareAccelerationMode} from './modules/HardwareAccelerationModule.js';
import {autoUpdater} from './modules/AutoUpdater.js';
import {allowInternalOrigins} from './modules/BlockNotAllowdOrigins.js';
import {allowExternalUrls} from './modules/ExternalUrls.js';
import {createAdminModule} from './modules/AdminModule.js';


export async function initApp(initConfig: AppInitConfig) {
  // Create navigation blocker with initial renderer origin
  // The AdminModule will add more URLs from its config
  const rendererOrigin = initConfig.renderer instanceof URL ? initConfig.renderer.origin : undefined;
  const navigationBlocker = allowInternalOrigins(
    new Set(rendererOrigin ? [rendererOrigin] : []),
  );

  // Read hardware acceleration setting from admin config early
  // Must be done before app.whenReady()
  const {AdminModule} = await import('./modules/AdminModule.js');
  const enableHardwareAcceleration = await AdminModule.getHardwareAccelerationSetting();

  const moduleRunner = createModuleRunner()
    .init(createWindowManagerModule({initConfig, openDevTools: false}))
    .init(createNewWindowManagerModule({initConfig}))
    .init(disallowMultipleAppInstance())
    .init(terminateAppOnLastWindowClose())
    .init(hardwareAccelerationMode({enable: enableHardwareAcceleration}))
    .init(autoUpdater())

    // Install DevTools extension if needed
    // .init(chromeDevToolsExtension({extension: 'VUEJS3_DEVTOOLS'}))

    // Admin Module - manages security, whitelists, and session time limits
    // Pass navigation blocker so admin can update whitelist dynamically
    .init(createAdminModule(navigationBlocker, rendererOrigin))

    // Security - navigation blocking (controlled by AdminModule)
    .init(navigationBlocker)
    .init(allowExternalUrls(
      new Set(
        initConfig.renderer instanceof URL
          ? [
          ]
          : [],
      )),
    );

  await moduleRunner;
}
