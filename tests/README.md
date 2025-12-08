# Smyles Station Test Suite

End-to-end tests for Smyles Station using Playwright.

## Test Coverage

### Application Startup
- Application launches without crashing
- Window is visible and not crashed
- Session prompt screen displays correctly

### Session Management
- Starting sessions via play button
- Session timer functionality
- Ending sessions
- Session state transitions

### Admin Access
- Settings menu navigation
- Password-protected admin access
- Admin dashboard access
- Close application functionality

### Website Grid
- Display of website grid
- Handling empty site lists
- Site tile rendering

### Admin Dashboard
- Successful admin login
- Navigation between tabs (Sites, Statistics, Settings, Schedule)
- Tab content visibility

### Site Management
- Add new site functionality
- Site management interface
- Site list display

### Settings Management
- Session time limit configuration
- Settings persistence
- Save functionality

### Usage Statistics
- Statistics display
- CSV export functionality
- Data visualization

### Shutdown Schedule
- Schedule interface
- Day-of-week configuration
- Time settings

### Security Features
- Keyboard shortcut blocking
- Password protection
- Unauthorized access prevention

### UI Components
- Timer formatting
- Responsive layout
- Component visibility

### Error Handling
- Graceful handling of missing config
- Recovery from invalid actions
- No crashes on rapid interactions

## Running Tests

### Prerequisites

1. Build the application:
   ```sh
   npm run build
   npm run compile
   ```

2. Ensure Playwright is installed:
   ```sh
   npx playwright install
   ```

### Run All Tests

```sh
npm test
```

### Run Tests in UI Mode

```sh
npx playwright test --ui
```

This opens the Playwright Test UI where you can:
- Run individual tests
- Debug tests
- Watch tests in real-time
- View test reports

### Run Specific Test Suite

```sh
npx playwright test tests/e2e.spec.ts -g "Session Management"
```

### Run Tests in Debug Mode

```sh
npx playwright test --debug
```

### Run Tests with Trace

```sh
npx playwright test --trace on
```

View traces:
```sh
npx playwright show-report
```

## Test Configuration

Tests are configured via `playwright.config.ts` in the root directory.

Default configuration:
- Timeout: 30 seconds per test
- Retries: 2 on CI, 0 locally
- Workers: 1 (Electron apps don't parallelize well)

## Writing New Tests

### Test Structure

```typescript
test.describe('Feature Name', () => {
  test('should do something specific', async ({page}) => {
    // Arrange
    const element = page.locator('.some-element');

    // Act
    await element.click();

    // Assert
    await expect(element).toBeVisible();
  });
});
```

### Helper Functions

Common helper functions are defined within test suites:

```typescript
async function loginAsAdmin(page: Page) {
  // Login logic
}
```

### Locator Strategies

Prefer in order:
1. Role-based: `page.getByRole('button', {name: 'Submit'})`
2. Text-based: `page.getByText('Admin Settings')`
3. CSS class: `page.locator('.admin-dashboard')`
4. Test ID: `page.locator('[data-testid="login"]')`

### Best Practices

1. **Use descriptive test names:**
   ```typescript
   test('should display error when wrong password is entered', ...)
   ```

2. **Wait for elements:**
   ```typescript
   await page.waitForSelector('.element');
   ```

3. **Use explicit assertions:**
   ```typescript
   await expect(element).toBeVisible();
   await expect(element).toHaveText('Expected Text');
   ```

4. **Clean up after tests:**
   Tests should be independent and not rely on previous test state.

5. **Handle async operations:**
   Always await async operations and use appropriate timeouts.

## Common Issues

### Tests failing on CI but passing locally

- Ensure compiled app exists in `dist/` directory
- Check for timing issues (increase timeouts if needed)
- Verify Playwright browsers are installed on CI

### "Executable path not found" error

Run the compile step:
```sh
npm run compile
```

The test looks for the compiled app in `dist/*/smyles-station{,.*}`

### Tests timing out

Increase timeout in specific test:
```typescript
test('slow test', async ({page}) => {
  test.setTimeout(60000); // 60 seconds
  // test code
});
```

Or globally in `playwright.config.ts`:
```typescript
timeout: 60000
```

### Element not found errors

1. Verify the element exists in the current view
2. Add appropriate waits: `await page.waitForSelector('.element')`
3. Check CSS class names haven't changed
4. Use Playwright Inspector to debug: `npx playwright test --debug`

## Debugging Tests

### Playwright Inspector

```sh
npx playwright test --debug
```

Features:
- Step through tests
- Inspect selectors
- View page state
- Record actions

### Screenshots on Failure

Tests automatically capture screenshots on failure in `test-results/`

### Video Recording

Enable in `playwright.config.ts`:
```typescript
use: {
  video: 'on-first-retry'
}
```

### Console Logs

Test captures console output from Electron app. Check test output for:
- `[electron][error]` - Electron errors
- `Page error:` - Renderer errors
- `Console error:` - Console.error messages

## Continuous Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Manual workflow dispatch

CI Configuration: `.github/workflows/test.yml`

Required steps:
1. Install dependencies
2. Build application
3. Compile application
4. Install Playwright browsers
5. Run tests
6. Upload test results

## Test Maintenance

### When to Update Tests

- After UI changes (new class names, text changes)
- After feature additions
- After bug fixes (add regression tests)
- When test becomes flaky (improve stability)

### Flaky Tests

If a test is flaky:
1. Add appropriate waits
2. Increase timeout
3. Check for race conditions
4. Verify element visibility before interaction
5. Use `test.retry()` if truly non-deterministic

### Test Coverage

Current coverage areas:
- ✅ Core session functionality
- ✅ Admin access and authentication
- ✅ Site management basics
- ✅ Settings configuration
- ✅ Security features
- ✅ UI components

Areas for expansion:
- 🔲 Site adding/editing/deleting workflows
- 🔲 Shutdown schedule execution
- 🔲 Session expiration and warnings
- 🔲 Usage statistics accuracy
- 🔲 Network failure handling
- 🔲 Data persistence across restarts

## Contributing

When adding new features:
1. Write tests for the feature
2. Ensure tests pass locally
3. Update this README if adding new test categories
4. Follow existing test patterns and naming

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Electron Testing](https://www.electronjs.org/docs/latest/tutorial/automated-testing)
- [Playwright Electron](https://playwright.dev/docs/api/class-electron)
