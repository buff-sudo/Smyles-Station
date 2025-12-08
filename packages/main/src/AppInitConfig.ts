/* BEGIN CODE FROM https://github.com/cawa-93/vite-electron-builder */
export interface AppInitConfig {
  preload: {
    path: string;
  };

  renderer:
    | {
        path: string;
      }
    | URL;
}
/* END CODE FROM https://github.com/cawa-93/vite-electron-builder */
