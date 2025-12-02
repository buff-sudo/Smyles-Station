import {net} from 'electron';

export interface SiteMetadata {
  title: string | null;
  iconUrl: string | null;
}

export class FaviconFetcher {
  /**
   * Fetches site metadata (title and favicon) from a given URL
   * Uses Electron's net module to bypass CORS restrictions
   */
  static async fetchSiteMetadata(url: string): Promise<SiteMetadata> {
    try {
      const parsedUrl = new URL(url);

      // Fetch HTML content
      const response = await net.fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      if (!response.ok) {
        console.warn(`Failed to fetch ${url}: ${response.status}`);
        return {title: null, iconUrl: null};
      }

      const html = await response.text();

      // Extract title using regex (simpler than adding cheerio dependency)
      const title = this.#extractTitle(html);

      // Extract favicon URL
      let iconUrl = this.#extractFaviconUrl(html, parsedUrl);

      return {title, iconUrl};
    } catch (error) {
      console.error(`Error fetching metadata for ${url}:`, error);
      return {title: null, iconUrl: null};
    }
  }

  /**
   * Extract title from HTML
   */
  static #extractTitle(html: string): string | null {
    // Try to find <title> tag
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      // Decode HTML entities and trim
      return titleMatch[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
    }

    return null;
  }

  /**
   * Extract favicon URL from HTML
   */
  static #extractFaviconUrl(html: string, baseUrl: URL): string | null {
    // Strategy 1: Look for apple-touch-icon (often high quality)
    const appleTouchMatch = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i);
    if (appleTouchMatch && appleTouchMatch[1]) {
      return this.#resolveUrl(appleTouchMatch[1], baseUrl);
    }

    // Strategy 2: Look for standard icon
    const iconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i);
    if (iconMatch && iconMatch[1]) {
      return this.#resolveUrl(iconMatch[1], baseUrl);
    }

    // Strategy 3: Look for href first, then rel (alternate format)
    const altIconMatch = html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:icon|shortcut icon)["']/i);
    if (altIconMatch && altIconMatch[1]) {
      return this.#resolveUrl(altIconMatch[1], baseUrl);
    }

    // Strategy 4: Default to /favicon.ico
    return this.#resolveUrl('/favicon.ico', baseUrl);
  }

  /**
   * Resolve a relative URL to absolute URL
   */
  static #resolveUrl(urlString: string, baseUrl: URL): string {
    try {
      // If already absolute, return as-is
      if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
        return urlString;
      }

      // If starts with //, add protocol
      if (urlString.startsWith('//')) {
        return baseUrl.protocol + urlString;
      }

      // Otherwise resolve relative to base URL
      return new URL(urlString, baseUrl.origin).href;
    } catch {
      // If resolution fails, try to construct from origin
      return `${baseUrl.origin}${urlString.startsWith('/') ? '' : '/'}${urlString}`;
    }
  }
}
