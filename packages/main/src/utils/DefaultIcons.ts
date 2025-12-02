import * as fs from 'node:fs';
import * as path from 'node:path';
import {app} from 'electron';

/**
 * Utility to convert icon files to data URLs for default configuration
 */
export class DefaultIcons {
  /**
   * Get data URL for an icon file
   * In production, icons should be bundled with the app
   * In development, we read from the renderer assets directory
   */
  static getIconDataUrl(iconName: 'pbs_kids' | 'abcmouse'): string | null {
    try {
      // Try to read from renderer assets (development)
      const devPath = path.join(process.cwd(), 'packages', 'renderer', 'src', 'assets', `${iconName}_icon.png`);

      if (fs.existsSync(devPath)) {
        const iconData = fs.readFileSync(devPath);
        const base64 = iconData.toString('base64');
        return `data:image/png;base64,${base64}`;
      }

      // If not found, return null (will fallback to auto-fetch)
      console.warn(`Icon file not found for ${iconName}, will use auto-fetched icon`);
      return null;
    } catch (error) {
      console.error(`Error loading icon for ${iconName}:`, error);
      return null;
    }
  }
}
