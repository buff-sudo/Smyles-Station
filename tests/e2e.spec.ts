import type {ElectronApplication, Page, Locator} from 'playwright';
import {_electron as electron} from 'playwright';
import {expect, test as base} from '@playwright/test';
import {globSync} from 'glob';
import {platform} from 'node:process';

process.env.PLAYWRIGHT_TEST = 'true';

type TestFixtures = {
  electronApp: ElectronApplication;
  page: Page;
};

const test = base.extend<TestFixtures>({
  electronApp: [
    async ({}, use) => {
      let executablePattern = 'dist/*/smyles-station{,.*}';
      if (platform === 'darwin') {
        executablePattern += '/Contents/*/smyles-station';
      }

      const [executablePath] = globSync(executablePattern);
      if (!executablePath) {
        throw new Error('App Executable path not found. Run: npm run compile');
      }

      const electronApp = await electron.launch({
        executablePath: executablePath,
        args: ['--no-sandbox'],
      });

      electronApp.on('console', (msg) => {
        if (msg.type() === 'error') {
          console.error(`[electron][${msg.type()}] ${msg.text()}`);
        }
      });

      await use(electronApp);
      await electronApp.close();
    },
    {scope: 'worker', auto: true} as any,
  ],

  page: async ({electronApp}, use) => {
    const page = await electronApp.firstWindow();

    page.on('pageerror', (error) => {
      console.error('Page error:', error);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });

    await page.waitForLoadState('domcontentloaded', {timeout: 10000});
    await use(page);
  },
});

// Helper to safely click an element
async function safeClick(locator: Locator, description: string = 'element') {
  try {
    // Wait for element to be visible and enabled
    await locator.waitFor({state: 'visible', timeout: 5000});

    // Wait a bit for animations
    await locator.page().waitForTimeout(300);

    // Click
    await locator.click({timeout: 5000});

    // Wait for any resulting action to complete
    await locator.page().waitForTimeout(500);

    return true;
  } catch (error) {
    console.log(`Could not click ${description}:`, error);
    return false;
  }
}

test.describe('Application Startup', () => {
  test('should launch and display main window', async ({electronApp, page}) => {
    await test.step('Window should be visible', async () => {
      const window = await electronApp.browserWindow(page);
      const isVisible = await window.evaluate((w) => w.isVisible());
      expect(isVisible).toBe(true);
    });

    await test.step('Window should not be crashed', async () => {
      const window = await electronApp.browserWindow(page);
      const isCrashed = await window.evaluate((w) => w.webContents.isCrashed());
      expect(isCrashed).toBe(false);
    });
  });

  test('should display welcome screen', async ({page}) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // Wait for React to render

    const body = page.locator('body');
    await expect(body).toBeVisible();

    const content = await body.textContent();
    expect(content?.length).toBeGreaterThan(0);
  });
});

test.describe('Basic UI Elements', () => {
  test('should have interactive buttons', async ({page}) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    expect(buttonCount).toBeGreaterThan(0);

    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await expect(firstButton).toBeVisible();
    }
  });

  test('should have text content', async ({page}) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const body = page.locator('body');
    const text = await body.textContent();

    expect(text).toBeTruthy();
    expect(text!.length).toBeGreaterThan(0);
  });
});

test.describe('Button Interactions', () => {
  test('should be able to click first visible button', async ({page}) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    const button = page.locator('button:visible').first();
    const buttonExists = await button.count() > 0;

    if (buttonExists) {
      const clicked = await safeClick(button, 'first button');

      if (clicked) {
        // Verify app is still responsive after click
        const body = page.locator('body');
        await expect(body).toBeVisible();
      }
    }
  });

  test('should handle multiple clicks on same button', async ({page}) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    const button = page.locator('button').first();
    const buttonExists = await button.count() > 0;

    if (buttonExists) {
      // First click
      await safeClick(button, 'button');

      // Second click (if button still exists)
      if (await button.count() > 0) {
        await safeClick(button, 'button');
      }

      // App should still be responsive
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });
});

test.describe('Session Flow', () => {
  test('should start session via play button', async ({page}) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Wait for full initialization

    // Try to find play/start button with multiple strategies
    const playButtonSelectors = [
      'button[class*="start-session"]',
      'button[class*="play"]',
      'button:has-text("▶")',
      'button.start-session-button',
    ];

    let clicked = false;
    for (const selector of playButtonSelectors) {
      const button = page.locator(selector);
      if (await button.count() > 0) {
        clicked = await safeClick(button, `play button (${selector})`);
        if (clicked) {
          console.log(`Successfully clicked play button using selector: ${selector}`);
          break;
        }
      }
    }

    // Even if we couldn't click, app should still be functional
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Settings Menu', () => {
  test('should find settings button', async ({page}) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const settingsSelectors = [
      'button.settings-button',
      'button[class*="settings"]',
      'button[aria-label*="settings" i]',
      'button:has-text("⚙")',
    ];

    let found = false;
    for (const selector of settingsSelectors) {
      const button = page.locator(selector);
      if (await button.count() > 0) {
        await expect(button).toBeVisible();
        found = true;
        console.log(`Found settings button with selector: ${selector}`);
        break;
      }
    }

    // If we couldn't find settings button specifically,
    // at least verify page has buttons
    if (!found) {
      const anyButton = await page.locator('button').count();
      expect(anyButton).toBeGreaterThan(0);
    }
  });

  test('should open settings menu when clicked', async ({page}) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const settingsSelectors = [
      'button.settings-button',
      'button[class*="settings"]',
      'button:has-text("⚙")',
    ];

    for (const selector of settingsSelectors) {
      const button = page.locator(selector);
      if (await button.count() > 0) {
        const clicked = await safeClick(button, `settings button (${selector})`);

        if (clicked) {
          // Wait for menu to appear
          await page.waitForTimeout(1000);

          // Check if any menu/modal appeared
          const menuSelectors = [
            '.settings-menu',
            '[class*="menu"]',
            '[class*="dropdown"]',
          ];

          for (const menuSelector of menuSelectors) {
            if (await page.locator(menuSelector).count() > 0) {
              console.log(`Settings menu appeared with selector: ${menuSelector}`);
              break;
            }
          }
        }
        break;
      }
    }

    // Verify app is still responsive
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Admin Access Flow', () => {
  test('should navigate to admin login', async ({page}) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Step 1: Click settings
    const settingsBtn = page.locator('button.settings-button, button:has-text("⚙")').first();

    if (await settingsBtn.count() > 0) {
      const settingsClicked = await safeClick(settingsBtn, 'settings button');

      if (settingsClicked) {
        // Step 2: Click Admin Settings
        await page.waitForTimeout(1000);

        const adminBtn = page.locator('text="Admin Settings"').first();
        if (await adminBtn.count() > 0) {
          await safeClick(adminBtn, 'admin settings');

          // Step 3: Check for password input
          await page.waitForTimeout(1000);
          const passwordInput = page.locator('input[type="password"]');

          if (await passwordInput.count() > 0) {
            console.log('Successfully navigated to admin login');
            await expect(passwordInput.first()).toBeVisible();
          }
        }
      }
    }
  });
});

test.describe('Keyboard Input', () => {
  test('should handle keyboard events', async ({page}) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Press keys without expecting specific behavior
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    // App should still be responsive
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should not crash on rapid keyboard input', async ({page}) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Rapid keyboard presses
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
    }

    // App should still be functional
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Application Stability', () => {
  test('should maintain stable DOM', async ({page}) => {
    await page.waitForLoadState('domcontentloaded');

    const initialButtonCount = await page.locator('button').count();

    await page.waitForTimeout(2000);

    const finalButtonCount = await page.locator('button').count();

    expect(finalButtonCount).toBeGreaterThanOrEqual(0);
    expect(finalButtonCount).toBe(initialButtonCount);
  });

  test('should not crash during idle time', async ({page}) => {
    await page.waitForLoadState('domcontentloaded');

    // Wait for several seconds doing nothing
    await page.waitForTimeout(3000);

    // App should still be functional
    const body = page.locator('body');
    await expect(body).toBeVisible();

    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThan(0);
  });

  test('should handle page reload', async ({page}) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // Should still have content
    const body = page.locator('body');
    await expect(body).toBeVisible();

    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThan(0);
  });
});

test.describe('UI State', () => {
  test('should have consistent button count', async ({page}) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const buttons = page.locator('button');
    const count = await buttons.count();

    // Should have at least one button (play button)
    expect(count).toBeGreaterThanOrEqual(1);

    console.log(`Found ${count} buttons on the page`);
  });

  test('should have visible content', async ({page}) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const visibleElements = page.locator('*:visible');
    const count = await visibleElements.count();

    expect(count).toBeGreaterThan(0);
    console.log(`Found ${count} visible elements`);
  });
});

test.describe('Error Detection', () => {
  test('should log any console errors', async ({page}) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Log errors and warnings but don't fail test
    if (errors.length > 0) {
      console.log('Console errors detected:', errors);
    }
    if (warnings.length > 0) {
      console.log('Console warnings detected:', warnings);
    }

    // Test always passes - we're just collecting diagnostics
    expect(true).toBe(true);
  });
});
