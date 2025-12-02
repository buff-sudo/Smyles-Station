import { FC, useState, useEffect } from 'react';
import './SiteManagement.css';
import type { WhitelistedSite } from '../electron';

export const SiteManagement: FC = () => {
  const [sites, setSites] = useState<WhitelistedSite[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [editingSite, setEditingSite] = useState<WhitelistedSite | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const allSites = await window.adminGetSites();
      setSites(allSites.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (error) {
      showMessage('error', 'Failed to load sites');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddSite = async () => {
    if (!newUrl.trim()) return;

    setLoading(true);
    try {
      const site = await window.adminAddSite(newUrl.trim());
      if (site) {
        await loadSites();
        setNewUrl('');
        showMessage('success', 'Site added successfully');
      } else {
        showMessage('error', 'Site already exists or failed to add (check for www/non-www duplicates)');
      }
    } catch (error) {
      showMessage('error', 'Failed to add site');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSite = async (siteId: string, siteName: string) => {
    if (!confirm(`Are you sure you want to delete "${siteName}"?`)) return;

    try {
      const success = await window.adminDeleteSite(siteId);
      if (success) {
        await loadSites();
        showMessage('success', 'Site deleted successfully');
      } else {
        showMessage('error', 'Failed to delete site');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete site');
    }
  };

  const handleUpdateSite = async () => {
    if (!editingSite) return;

    try {
      const success = await window.adminUpdateSite(editingSite.id, {
        url: editingSite.url,
        displayName: editingSite.displayName || null,
        iconUrl: editingSite.iconUrl || null,
        showOnSelectionScreen: editingSite.showOnSelectionScreen,
      });

      if (success) {
        await loadSites();
        setEditingSite(null);
        showMessage('success', 'Site updated successfully');
      } else {
        showMessage('error', 'Failed to update site');
      }
    } catch (error) {
      showMessage('error', 'Failed to update site');
    }
  };

  const handleRefreshMetadata = async (siteId: string) => {
    try {
      const success = await window.adminRefreshSiteMetadata(siteId);
      if (success) {
        await loadSites();
        showMessage('success', 'Metadata refreshed successfully');
      } else {
        showMessage('error', 'Failed to refresh metadata');
      }
    } catch (error) {
      showMessage('error', 'Failed to refresh metadata');
    }
  };

  const handleMoveUp = async (site: WhitelistedSite) => {
    const index = sites.findIndex(s => s.id === site.id);
    if (index <= 0) return;

    const newOrder = [...sites];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];

    const siteIds = newOrder.map(s => s.id);
    const success = await window.adminReorderSites(siteIds);
    if (success) {
      await loadSites();
    }
  };

  const handleMoveDown = async (site: WhitelistedSite) => {
    const index = sites.findIndex(s => s.id === site.id);
    if (index >= sites.length - 1) return;

    const newOrder = [...sites];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];

    const siteIds = newOrder.map(s => s.id);
    const success = await window.adminReorderSites(siteIds);
    if (success) {
      await loadSites();
    }
  };

  const getSiteName = (site: WhitelistedSite): string => {
    return site.displayName || site.autoFetchedTitle || new URL(site.url).hostname;
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddSite();
    }
  };

  return (
    <div className="site-management">
      <h2>Website Management</h2>
      <p className="site-management-description">
        Add, edit, and manage websites that can be accessed from the selection screen.
      </p>

      {message && (
        <div className={`site-message site-message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Add Site Form */}
      <div className="add-site-form">
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="https://example.com"
          disabled={loading}
          className="add-site-input"
        />
        <button
          onClick={handleAddSite}
          disabled={!newUrl.trim() || loading}
          className="add-site-button"
        >
          {loading ? 'Adding...' : 'Add Site'}
        </button>
      </div>

      {/* Sites List */}
      <div className="sites-list">
        {sites.map((site, index) => (
          <div key={site.id} className="site-item">
            {editingSite?.id === site.id ? (
              // Edit Mode
              <div className="site-edit-form">
                <div className="site-edit-field">
                  <label>URL:</label>
                  <input
                    type="url"
                    value={editingSite.url}
                    onChange={(e) => setEditingSite({ ...editingSite, url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="site-edit-field">
                  <label>Display Name (optional):</label>
                  <input
                    type="text"
                    value={editingSite.displayName || ''}
                    onChange={(e) => setEditingSite({ ...editingSite, displayName: e.target.value || null })}
                    placeholder="Leave empty to use auto-fetched title"
                  />
                </div>
                <div className="site-edit-field">
                  <label>Icon URL (optional):</label>
                  <input
                    type="text"
                    value={editingSite.iconUrl || ''}
                    onChange={(e) => setEditingSite({ ...editingSite, iconUrl: e.target.value || null })}
                    placeholder="Leave empty to use auto-fetched icon"
                  />
                </div>
                <div className="site-edit-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={editingSite.showOnSelectionScreen}
                      onChange={(e) => setEditingSite({ ...editingSite, showOnSelectionScreen: e.target.checked })}
                    />
                    Show on selection screen
                  </label>
                </div>
                <div className="site-edit-buttons">
                  <button onClick={handleUpdateSite} className="save-button">Save</button>
                  <button onClick={() => setEditingSite(null)} className="cancel-button">Cancel</button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="site-info">
                  <div className="site-header">
                    <span className="site-order">{index + 1}.</span>
                    <span className="site-name">{getSiteName(site)}</span>
                    <span className={`site-visibility ${site.showOnSelectionScreen ? 'visible' : 'hidden'}`}>
                      {site.showOnSelectionScreen ? '✓ Visible' : '✗ Hidden'}
                    </span>
                  </div>
                  <div className="site-url">{site.url}</div>
                  {site.autoFetchedTitle && !site.displayName && (
                    <div className="site-meta">Auto-fetched: {site.autoFetchedTitle}</div>
                  )}
                </div>

                <div className="site-actions">
                  <button
                    onClick={() => handleMoveUp(site)}
                    disabled={index === 0}
                    title="Move up"
                    className="action-button"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveDown(site)}
                    disabled={index === sites.length - 1}
                    title="Move down"
                    className="action-button"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => handleRefreshMetadata(site.id)}
                    title="Refresh metadata"
                    className="action-button"
                  >
                    🔄
                  </button>
                  <button
                    onClick={() => setEditingSite(site)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSite(site.id, getSiteName(site))}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {sites.length === 0 && (
        <div className="empty-state">
          <p>No sites added yet. Add your first site above!</p>
        </div>
      )}
    </div>
  );
};
