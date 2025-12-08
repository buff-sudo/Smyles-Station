/* BEGIN CODE FROM https://github.com/cawa-93/vite-electron-builder */
import {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';

class ApplicationTerminatorOnLastWindowClose implements AppModule {
  enable({app}: ModuleContext): Promise<void> | void {
    app.on('window-all-closed', () => app.quit());
  }
}


export function terminateAppOnLastWindowClose(...args: ConstructorParameters<typeof ApplicationTerminatorOnLastWindowClose>) {
  return new ApplicationTerminatorOnLastWindowClose(...args);
}
/* END CODE FROM https://github.com/cawa-93/vite-electron-builder */
