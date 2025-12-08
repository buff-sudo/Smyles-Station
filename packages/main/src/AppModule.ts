/* BEGIN CODE FROM https://github.com/cawa-93/vite-electron-builder */
import type {ModuleContext} from './ModuleContext.js';

export interface AppModule {
  enable(context: ModuleContext): Promise<void>|void;
}
/* END CODE FROM https://github.com/cawa-93/vite-electron-builder */
