import type {AppModule} from './AppModule.js';
import type {AdminModule} from './modules/AdminModule.js';

/**
 * Interface for modules that extend admin panel functionality.
 *
 * Admin features are modules that require access to admin configuration
 * and settings. They follow a consistent pattern for extensibility.
 *
 * @example
 * ```typescript
 * export class MyAdminFeature implements AdminFeature {
 *   readonly featureName = 'my-feature';
 *   readonly description = 'Description of what this feature does';
 *
 *   constructor(private adminModule: AdminModule) {}
 *
 *   async enable(context: ModuleContext): Promise<void> {
 *     // Setup IPC handlers, register event listeners, etc.
 *   }
 * }
 *
 * export function createMyAdminFeature(adminModule: AdminModule): MyAdminFeature {
 *   return new MyAdminFeature(adminModule);
 * }
 * ```
 */
export interface AdminFeature extends AppModule {
  /**
   * Unique identifier for this feature.
   * Used for logging, debugging, and feature discovery.
   */
  readonly featureName: string;

  /**
   * Human-readable description of what this feature does.
   * Useful for documentation and feature listings.
   */
  readonly description: string;
}

/**
 * Factory function type for creating admin features.
 * This pattern allows for clean dependency injection of the AdminModule, UsageStatsModule, and NewWindowManager.
 */
export type AdminFeatureFactory = (
  adminModule: AdminModule,
  usageStats?: import('./modules/UsageStatsModule.js').UsageStatsModule,
  newWindowManager?: import('./modules/NewWindowManager.js').NewWindowManager
) => AdminFeature;
