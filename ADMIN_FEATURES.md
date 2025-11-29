# Creating Admin Features

This guide explains how to create custom admin features for the application. Admin features are extensible modules that integrate with the admin panel and have access to admin configuration.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [The AdminFeature Interface](#the-adminfeature-interface)
- [Step-by-Step Tutorial](#step-by-step-tutorial)
- [Example: Session Manager](#example-session-manager)
- [Best Practices](#best-practices)
- [Publishing Your Feature](#publishing-your-feature)

## Overview

Admin features are modules that:
- Implement the `AdminFeature` interface
- Have access to `AdminModule` for configuration and settings
- Can register IPC handlers for communication with the renderer process
- Are automatically initialized when the app starts

The architecture is designed to be:
- **Extensible**: Add features without modifying core code
- **Modular**: Each feature is independent and testable
- **Discoverable**: Features self-document with name and description

## Quick Start

```typescript
// 1. Create your feature module
import type {AdminFeature} from '../AdminFeature.js';
import type {ModuleContext} from '../ModuleContext.js';
import type {AdminModule} from './AdminModule.js';
import {ipcMain} from 'electron';

export class MyFeature implements AdminFeature {
  readonly featureName = 'my-feature';
  readonly description = 'Does something cool';

  constructor(private adminModule: AdminModule) {}

  async enable(context: ModuleContext): Promise<void> {
    // Setup your IPC handlers here
    ipcMain.handle('my-feature:do-something', async () => {
      const settings = await this.adminModule.getSettings();
      // Use settings to do something
      return true;
    });
  }
}

// 2. Export a factory function
export function createMyFeature(adminModule: AdminModule): MyFeature {
  return new MyFeature(adminModule);
}
```

```typescript
// 3. Register in index.ts
import {createMyFeature} from './modules/MyFeature.js';

export async function initApp(initConfig: AppInitConfig) {
  await createAdminApp(initConfig)
    .then(builder => builder.withAdminFeatures([
      createSessionModule,
      createMyFeature,  // Add your feature here!
    ]))
    .then(builder => builder.build());
}
```

## The AdminFeature Interface

```typescript
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
```

All admin features must implement:
- `featureName`: A unique, kebab-case identifier (e.g., "my-cool-feature")
- `description`: A brief explanation of what the feature does
- `enable(context)`: Initialize the feature (from AppModule interface)

## Step-by-Step Tutorial

### 1. Create Your Feature File

Create a new file in `packages/main/src/modules/`:

```typescript
// packages/main/src/modules/MyFeature.ts
import type {AdminFeature} from '../AdminFeature.js';
import type {ModuleContext} from '../ModuleContext.js';
import type {AdminModule} from './AdminModule.js';
import {ipcMain, BrowserWindow} from 'electron';

export class MyFeature implements AdminFeature {
  readonly featureName = 'my-feature';
  readonly description = 'My custom admin feature';

  #adminModule: AdminModule;

  constructor(adminModule: AdminModule) {
    this.#adminModule = adminModule;
  }

  async enable(context: ModuleContext): Promise<void> {
    this.#setupIPCHandlers();
  }

  #setupIPCHandlers(): void {
    // Register your IPC handlers here
    ipcMain.handle('my-feature:action', async () => {
      // Your logic here
      return true;
    });
  }
}

export function createMyFeature(adminModule: AdminModule): MyFeature {
  return new MyFeature(adminModule);
}
```

### 2. Access Admin Settings

Your feature can access admin configuration:

```typescript
async enable(context: ModuleContext): Promise<void> {
  // Get current admin settings
  const settings = await this.#adminModule.getSettings();

  if (settings) {
    console.log('Whitelisted URLs:', settings.whitelistedUrls);
    console.log('Session time limit:', settings.sessionTimeLimit);
    console.log('Dev tools blocked:', settings.blockDevTools);
  }

  this.#setupIPCHandlers();
}
```

### 3. Add IPC Handlers

Communicate with the renderer process:

```typescript
#setupIPCHandlers(): void {
  // Handler with no arguments
  ipcMain.handle('my-feature:get-status', async () => {
    return {active: true, data: 'some data'};
  });

  // Handler with arguments
  ipcMain.handle('my-feature:do-action', async (_event, arg1, arg2) => {
    // Process arguments
    return {success: true};
  });

  // Send events to renderer
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('my-feature:notification', {message: 'Hello!'});
  });
}
```

### 4. Export Your Feature

Add the preload API (in `packages/preload/src/index.ts`):

```typescript
// Add to preload
function myFeatureGetStatus(): Promise<{active: boolean; data: string}> {
  return ipcRenderer.invoke('my-feature:get-status');
}

function myFeatureDoAction(arg1: string, arg2: number): Promise<{success: boolean}> {
  return ipcRenderer.invoke('my-feature:do-action', arg1, arg2);
}

function myFeatureOnNotification(callback: (data: {message: string}) => void) {
  ipcRenderer.on('my-feature:notification', (_event, data) => callback(data));
}

export {
  // ... existing exports
  myFeatureGetStatus,
  myFeatureDoAction,
  myFeatureOnNotification,
};
```

### 5. Register Your Feature

Add to `packages/main/src/index.ts`:

```typescript
import {createMyFeature} from './modules/MyFeature.js';

export async function initApp(initConfig: AppInitConfig) {
  await createAdminApp(initConfig)
    .then(builder => builder.withAdminFeatures([
      createSessionModule,
      createMyFeature,  // Add here
    ]))
    .then(builder => builder.build());
}
```

## Example: Session Manager

The built-in `SessionModule` is a complete example of an admin feature. Here are key patterns it demonstrates:

### Feature Metadata

```typescript
export class SessionModule implements AdminFeature {
  readonly featureName = 'session-manager';
  readonly description = 'Manages timed sessions with automatic expiration and warnings';
  // ...
}
```

### Accessing Admin Settings

```typescript
ipcMain.handle('session:start', async () => {
  // Get session time limit from admin config
  const settings = await this.#adminModule.getSettings();
  const timeLimit = settings?.sessionTimeLimit ?? 0;
  this.startSession(timeLimit);
  return true;
});
```

### Complex State Management

```typescript
#state: GlobalSessionState = {
  isActive: false,
  startTime: null,
  timeLimit: 0,
  warningShown: false,
  sessionTimer: null,
  warningTimer: null,
  statusBroadcastInterval: null,
};
```

### Broadcasting to All Windows

```typescript
#broadcastToAllWindows(channel: string, ...args: any[]): void {
  BrowserWindow.getAllWindows().forEach(win => {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, ...args);
    }
  });
}
```

See the full implementation in `packages/main/src/modules/SessionModule.ts`.

## Best Practices

### 1. Use Private Fields for Internal State

```typescript
export class MyFeature implements AdminFeature {
  #privateState: SomeType;
  #adminModule: AdminModule;

  constructor(adminModule: AdminModule) {
    this.#adminModule = adminModule;
  }
}
```

### 2. Prefix Your IPC Channels

Use a consistent prefix based on your feature name:

```typescript
// Good
ipcMain.handle('my-feature:action', ...)
ipcMain.handle('my-feature:get-status', ...)

// Bad (conflicts with other features)
ipcMain.handle('action', ...)
ipcMain.handle('get-status', ...)
```

### 3. Clean Up Resources

```typescript
async disable(): Promise<void> {
  // Clear timers
  if (this.#timer) {
    clearInterval(this.#timer);
  }

  // Remove IPC handlers
  ipcMain.removeHandler('my-feature:action');
}
```

### 4. Handle Errors Gracefully

```typescript
ipcMain.handle('my-feature:action', async () => {
  try {
    const settings = await this.#adminModule.getSettings();
    // Process...
    return {success: true};
  } catch (error) {
    console.error('MyFeature error:', error);
    return {success: false, error: error.message};
  }
});
```

### 5. Provide Type Safety

```typescript
// Define clear interfaces for your data
export interface MyFeatureStatus {
  active: boolean;
  data: string;
  timestamp: number;
}

ipcMain.handle('my-feature:get-status', async (): Promise<MyFeatureStatus> => {
  return {
    active: this.#isActive,
    data: this.#data,
    timestamp: Date.now(),
  };
});
```

### 6. Document Your IPC API

```typescript
#setupIPCHandlers(): void {
  /**
   * Starts the feature with the given configuration.
   * @param config - Feature configuration object
   * @returns Promise<boolean> - true if started successfully
   */
  ipcMain.handle('my-feature:start', async (_event, config) => {
    // ...
  });
}
```

## Publishing Your Feature

To publish your admin feature as a separate package:

### 1. Create a New Package

```bash
mkdir my-admin-feature
cd my-admin-feature
npm init
```

### 2. Structure Your Package

```
my-admin-feature/
├── src/
│   ├── main/
│   │   └── MyFeature.ts      # Main process module
│   └── preload/
│       └── api.ts             # Preload API
├── package.json
├── README.md
└── tsconfig.json
```

### 3. Export Your Feature

```typescript
// src/main/index.ts
export {MyFeature, createMyFeature} from './MyFeature.js';
export type {MyFeatureStatus} from './MyFeature.js';
```

### 4. Document Usage

Create a README.md with:
- Installation instructions
- Configuration options
- IPC API reference
- Example code

### 5. Publish to npm

```bash
npm publish
```

### Users Install Your Feature

```bash
npm install my-admin-feature
```

```typescript
// packages/main/src/index.ts
import {createMyFeature} from 'my-admin-feature';

export async function initApp(initConfig: AppInitConfig) {
  await createAdminApp(initConfig)
    .then(builder => builder.withAdminFeatures([
      createSessionModule,
      createMyFeature,
    ]))
    .then(builder => builder.build());
}
```

## Need Help?

- See `SessionModule.ts` for a complete working example
- Check the `AdminFeature` interface documentation
- Look at how `AdminModule` provides settings access

Happy building! 🚀
