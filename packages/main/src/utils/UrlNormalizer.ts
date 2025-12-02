/**
 * Utility for safely normalizing URLs to handle www/non-www equivalence
 * SECURITY NOTE: Only normalizes the "www." subdomain at the start of hostname,
 * never touches "www" appearing elsewhere in the domain name
 */
export class UrlNormalizer {
  /**
   * Normalize a URL by removing the "www." subdomain if present
   * Examples:
   *   https://www.pbskids.org/games -> https://pbskids.org/games
   *   https://pbskids.org/games -> https://pbskids.org/games (no change)
   *   https://pbswwwkids.org -> https://pbswwwkids.org (no change - "www" is part of domain)
   */
  static normalize(urlString: string): string {
    try {
      const url = new URL(urlString);

      // Only remove "www." if it's a subdomain at the start
      if (url.hostname.startsWith('www.')) {
        url.hostname = url.hostname.substring(4); // Remove "www."
      }

      return url.href;
    } catch (error) {
      // If URL parsing fails, return original string
      return urlString;
    }
  }

  /**
   * Get normalized origin from a URL
   * Examples:
   *   https://www.pbskids.org/games -> https://pbskids.org
   *   https://pbskids.org/games -> https://pbskids.org
   */
  static normalizedOrigin(urlString: string): string {
    try {
      const url = new URL(urlString);

      // Normalize hostname
      if (url.hostname.startsWith('www.')) {
        url.hostname = url.hostname.substring(4);
      }

      return url.origin;
    } catch (error) {
      return urlString;
    }
  }

  /**
   * Check if two URLs are equivalent (same origin, accounting for www/non-www)
   */
  static areEquivalent(url1: string, url2: string): boolean {
    try {
      return this.normalizedOrigin(url1) === this.normalizedOrigin(url2);
    } catch {
      return url1 === url2;
    }
  }

  /**
   * Check if a URL matches any in a list (normalized comparison)
   */
  static matchesAny(urlToCheck: string, allowedUrls: string[]): boolean {
    const normalizedOrigin = this.normalizedOrigin(urlToCheck);

    return allowedUrls.some(allowed => {
      const allowedOrigin = this.normalizedOrigin(allowed);
      return normalizedOrigin === allowedOrigin;
    });
  }
}
