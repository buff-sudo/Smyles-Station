import { type FC, useState, useEffect, useMemo } from 'react';
import './WebsiteGrid.css';
import type { WhitelistedSite } from '../electron';

interface WebsiteGridProps {
  onOpenSite: (url: string, name: string) => void;
}

const ITEMS_PER_PAGE = 12;

export const WebsiteGrid: FC<WebsiteGridProps> = ({ onOpenSite }) => {
  const [sites, setSites] = useState<WhitelistedSite[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSites();

    // Listen for admin settings changes to reload sites in real-time
    window.adminOnSettingsChanged(() => {
      loadSites();
    });
  }, []);

  const loadSites = async () => {
    try {
      const allSites = await window.adminGetSites();
      // Filter to only show sites marked for display, sorted by display order
      const visibleSites = allSites
        .filter(site => site.showOnSelectionScreen)
        .sort((a, b) => a.displayOrder - b.displayOrder);
      setSites(visibleSites);
    } catch (error) {
      console.error('Failed to load sites:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter sites based on search query
  const filteredSites = useMemo(() => {
    if (!searchQuery.trim()) return sites;

    const query = searchQuery.toLowerCase();
    return sites.filter(site => {
      const name = getSiteName(site).toLowerCase();
      const url = site.url.toLowerCase();
      return name.includes(query) || url.includes(query);
    });
  }, [sites, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredSites.length / ITEMS_PER_PAGE);
  const paginatedSites = filteredSites.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  const getSiteName = (site: WhitelistedSite): string => {
    return site.displayName || site.autoFetchedTitle || new URL(site.url).hostname;
  };

  const getSiteIcon = (site: WhitelistedSite): string | null => {
    return site.iconUrl || site.autoFetchedIconUrl || null;
  };

  const handleIconError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Hide the image and show fallback
    e.currentTarget.style.display = 'none';
    const wrapper = e.currentTarget.parentElement;
    if (wrapper) {
      wrapper.classList.add('icon-fallback');
    }
  };

  if (loading) {
    return (
      <div className="website-grid-container">
        <div className="website-grid-loading">Loading sites...</div>
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="website-grid-container">
        <div className="website-grid-empty">
          <p>No websites available.</p>
          <p>Ask an administrator to add sites.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="website-grid-container">
      {/* Search Bar (only show if there are more than 6 sites) */}
      {sites.length > 6 && (
        <div className="website-search-bar">
          <input
            type="text"
            placeholder="Search websites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="website-search-input"
          />
        </div>
      )}

      {/* Grid */}
      <div className="website-grid">
        {paginatedSites.map((site) => {
          const siteName = getSiteName(site);
          const siteIcon = getSiteIcon(site);

          return (
            <button
              key={site.id}
              className="website-card"
              onClick={() => onOpenSite(site.url, siteName)}
              aria-label={`Open ${siteName}`}
            >
              <div className="website-icon-wrapper" data-letter={siteName[0]?.toUpperCase()}>
                {siteIcon ? (
                  <img
                    src={siteIcon}
                    alt={siteName}
                    className="website-icon"
                    onError={handleIconError}
                  />
                ) : (
                  <div className="website-icon-fallback">
                    {siteName[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <h2 className="website-name">{siteName}</h2>
            </button>
          );
        })}
      </div>

      {/* Pagination Controls (only show if there are multiple pages) */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="pagination-button"
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            ← Previous
          </button>

          <div className="pagination-info">
            Page {currentPage + 1} of {totalPages}
          </div>

          <button
            className="pagination-button"
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next →
          </button>
        </div>
      )}

      {/* Empty search results */}
      {filteredSites.length === 0 && searchQuery && (
        <div className="website-grid-empty">
          <p>No websites found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};
