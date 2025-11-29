import type {AppInitConfig} from './AppInitConfig.js';
import {createAdminApp} from './AdminAppBuilder.js';
import {createSessionModule} from './modules/SessionModule.js';

/**
 * Initialize the application with admin features.
 *
 * This function uses the AdminAppBuilder to set up all core modules
 * and admin features. To add custom admin features, simply add their
 * factory functions to the withAdminFeatures() array.
 *
 * @param initConfig - Application initialization configuration
 *
 * @example Adding a custom admin feature:
 * ```typescript
 * import {createMyCustomFeature} from './my-custom-feature.js';
 *
 * await createAdminApp(initConfig)
 *   .then(builder => builder.withAdminFeatures([
 *     createSessionModule,
 *     createMyCustomFeature,  // Your custom feature here
 *   ]))
 *   .then(builder => builder.build());
 * ```
 */
export async function initApp(initConfig: AppInitConfig) {
  await createAdminApp(initConfig)
    .then(builder => builder.withAdminFeatures([
      createSessionModule,
      // Add more admin features here
    ]))
    .then(builder => builder.build());
}
