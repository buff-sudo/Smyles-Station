import type {AppInitConfig} from './AppInitConfig.js';
import type {AdminFeatureFactory} from './AdminFeature.js';
import {createModuleRunner} from './ModuleRunner.js';
import {disallowMultipleAppInstance} from './modules/SingleInstanceApp.js';
import {createWindowManagerModule} from './modules/WindowManager.js';
import {createNewWindowManagerModule} from './modules/NewWindowManager.js';
import {terminateAppOnLastWindowClose} from './modules/ApplicationTerminatorOnLastWindowClose.js';
import {hardwareAccelerationMode} from './modules/HardwareAccelerationModule.js';
import {autoUpdater} from './modules/AutoUpdater.js';
import {allowInternalOrigins} from './modules/BlockNotAllowdOrigins.js';
import {allowExternalUrls} from './modules/ExternalUrls.js';
import {createAdminModule, AdminModule} from './modules/AdminModule.js';

/**
 * Builder for creating an admin-enabled application with extensible features.
 *
 * This builder simplifies the initialization of the application and provides
 * a clean API for adding admin features (both built-in and custom).
 *
 * @example
 * ```typescript
 * import {createAdminApp} from './AdminAppBuilder.js';
 * import {createSessionModule} from './modules/SessionModule.js';
 * import {createMyCustomFeature} from './my-custom-feature.js';
 *
 * await createAdminApp(initConfig)
 *   .withAdminFeatures([
 *     createSessionModule,
 *     createMyCustomFeature,
 *   ])
 *   .build();
 * ```
 */
export class AdminAppBuilder {
  #initConfig: AppInitConfig;
  #adminModule: AdminModule;
  #navigationBlocker: ReturnType<typeof allowInternalOrigins>;
  #rendererOrigin: string | undefined;
  #enableHardwareAcceleration: boolean;
  #adminFeatures: AdminFeatureFactory[] = [];

  constructor(
    initConfig: AppInitConfig,
    enableHardwareAcceleration: boolean,
  ) {
    this.#initConfig = initConfig;
    this.#enableHardwareAcceleration = enableHardwareAcceleration;

    // Setup renderer origin and navigation blocker
    this.#rendererOrigin = initConfig.renderer instanceof URL
      ? initConfig.renderer.origin
      : undefined;

    this.#navigationBlocker = allowInternalOrigins(
      new Set(this.#rendererOrigin ? [this.#rendererOrigin] : []),
    );

    // Create admin module
    this.#adminModule = createAdminModule(this.#navigationBlocker, this.#rendererOrigin);
  }

  /**
   * Register admin features to be enabled.
   *
   * @param features - Array of factory functions that create admin feature modules
   * @returns This builder for chaining
   *
   * @example
   * ```typescript
   * builder.withAdminFeatures([
   *   createSessionModule,
   *   createLoggingModule,
   *   createMyCustomFeature,
   * ])
   * ```
   */
  withAdminFeatures(features: AdminFeatureFactory[]): this {
    this.#adminFeatures = features;
    return this;
  }

  /**
   * Build and initialize the application with all configured modules.
   *
   * @returns Promise that resolves when all modules are initialized
   */
  async build(): Promise<void> {
    const moduleRunner = createModuleRunner()
      // Core modules
      .init(createWindowManagerModule({
        initConfig: this.#initConfig,
        openDevTools: false,
      }))
      .init(createNewWindowManagerModule({initConfig: this.#initConfig}))
      .init(disallowMultipleAppInstance())
      .init(terminateAppOnLastWindowClose())
      .init(hardwareAccelerationMode({enable: this.#enableHardwareAcceleration}))
      .init(autoUpdater())

      // Admin module
      .init(this.#adminModule);

    // Register all admin features
    for (const factory of this.#adminFeatures) {
      const feature = factory(this.#adminModule);
      console.log(`Registering admin feature: ${feature.featureName} - ${feature.description}`);
      moduleRunner.init(feature);
    }

    // Security modules (must come after admin features)
    moduleRunner
      .init(this.#navigationBlocker)
      .init(allowExternalUrls(
        new Set(
          this.#initConfig.renderer instanceof URL ? [] : [],
        ),
      ));

    await moduleRunner;
  }
}

/**
 * Create an admin application builder.
 *
 * This is the main entry point for initializing an application with admin features.
 *
 * @param initConfig - Application initialization configuration
 * @returns Builder instance for configuring and building the app
 *
 * @example
 * ```typescript
 * import {createAdminApp} from './AdminAppBuilder.js';
 * import {createSessionModule} from './modules/SessionModule.js';
 *
 * export async function initApp(initConfig: AppInitConfig) {
 *   await createAdminApp(initConfig)
 *     .withAdminFeatures([
 *       createSessionModule,
 *     ])
 *     .build();
 * }
 * ```
 */
export async function createAdminApp(initConfig: AppInitConfig): Promise<AdminAppBuilder> {
  // Read hardware acceleration setting early (must be before app.whenReady())
  const enableHardwareAcceleration = await AdminModule.getHardwareAccelerationSetting();

  return new AdminAppBuilder(initConfig, enableHardwareAcceleration);
}
