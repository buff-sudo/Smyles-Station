// Type definitions for Electron APIs exposed through contextBridge

declare global {
  interface Window {
    // Exposed functions from preload
    sha256sum: (data: string) => Promise<string>;
    versions: {
      node: string;
      chrome: string;
      electron: string;
    };
    send: (channel: string, message: string) => Promise<unknown>;
    openNewWindow: (url: string) => Promise<number>;
  }
}

export {};