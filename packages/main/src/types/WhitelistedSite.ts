export interface WhitelistedSite {
  id: string;                    // UUID for stable identification
  url: string;                   // Full URL (e.g., "https://pbskids.org/games")
  displayName: string | null;    // Custom name (null = use auto-fetched title)
  iconUrl: string | null;        // Custom icon URL or data URL (null = use favicon)
  showOnSelectionScreen: boolean;// Whether to display on selection screen
  displayOrder: number;          // Sort order (0-based index)
  autoFetchedTitle?: string | null;     // Cached page title from last fetch
  autoFetchedIconUrl?: string | null;   // Cached favicon URL from last fetch
  lastUpdated: number;           // Timestamp of last modification
  createdAt: number;             // Timestamp of creation
}
