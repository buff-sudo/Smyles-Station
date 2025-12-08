/* BEGIN CODE FROM https://github.com/cawa-93/vite-electron-builder */
import {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';

export abstract class AbstractSecurityRule implements AppModule {
  enable({app}: ModuleContext): Promise<void> | void {
    app.on('web-contents-created', (_, contents) => this.applyRule(contents))
  }

  abstract applyRule(contents: Electron.WebContents): Promise<void> | void;
}
/* END CODE FROM https://github.com/cawa-93/vite-electron-builder */
