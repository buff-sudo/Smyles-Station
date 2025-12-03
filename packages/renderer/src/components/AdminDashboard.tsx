import { type FC, useState, useEffect } from 'react';
import './AdminDashboard.css';
import { SiteManagement } from './SiteManagement';

interface AdminSettings {
  whitelistedUrls: string[];
  sessionTimeLimit: number;
  blockDevTools: boolean;
  blockTaskManager: boolean;
  enableHardwareAcceleration: boolean;
  autoStartOnBoot: boolean;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

interface UsageStatsSummary {
  totalSessions: number;
  completedSessions: number;
  totalGames: number;
  completedGames: number;
  totalSessionTime: number;
  totalGameTime: number;
  averageSessionTime: number;
  averageGameTime: number;
}

export const AdminDashboard: FC<AdminDashboardProps> = ({ onLogout }) => {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStatsSummary | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Form states
  // const [newUrl, setNewUrl] = useState(''); // Deprecated: moved to SiteManagement
  const [timeLimit, setTimeLimit] = useState(0);
  const [blockDevTools, setBlockDevTools] = useState(true);
  const [blockTaskManager, setBlockTaskManager] = useState(true);
  const [enableHardwareAcceleration, setEnableHardwareAcceleration] = useState(true);
  const [autoStartOnBoot, setAutoStartOnBoot] = useState(true);

  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadSettings();
    loadUsageStats();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await window.adminGetSettings();
      if (data) {
        setSettings(data);
        setTimeLimit(data.sessionTimeLimit);
        setBlockDevTools(data.blockDevTools);
        setBlockTaskManager(data.blockTaskManager);
        setEnableHardwareAcceleration(data.enableHardwareAcceleration);
        setAutoStartOnBoot(data.autoStartOnBoot);
      }
    } catch (err) {
      showMessage('error', 'Failed to load settings');
      console.error('Load settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const loadUsageStats = async () => {
    setStatsLoading(true);
    try {
      const stats = await window.statsGetSummary();
      setUsageStats(stats);
    } catch (err) {
      console.error('Load usage stats error:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const csvData = await window.statsDownloadCSV();

      // Create blob and download link
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `usage-stats-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showMessage('success', 'CSV downloaded successfully');
    } catch (err) {
      showMessage('error', 'Failed to download CSV');
      console.error('Download CSV error:', err);
    }
  };

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.round(milliseconds / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Deprecated: URL management moved to SiteManagement component
  // const handleAddUrl = async () => {
  //   if (!newUrl || !settings) return;
  //
  //   try {
  //     const updatedUrls = [...settings.whitelistedUrls, newUrl];
  //     const success = await window.adminUpdateWhitelist(updatedUrls);
  //     if (success) {
  //       setSettings({ ...settings, whitelistedUrls: updatedUrls });
  //       setNewUrl('');
  //       showMessage('success', 'URL added successfully');
  //     } else {
  //       showMessage('error', 'Failed to add URL');
  //     }
  //   } catch (err) {
  //     showMessage('error', 'Failed to add URL');
  //     console.error('Add URL error:', err);
  //   }
  // };

  // Deprecated: URL management moved to SiteManagement component
  // const handleRemoveUrl = async (url: string) => {
  //   if (!settings) return;
  //
  //   try {
  //     const updatedUrls = settings.whitelistedUrls.filter(u => u !== url);
  //     const success = await window.adminUpdateWhitelist(updatedUrls);
  //     if (success) {
  //       setSettings({ ...settings, whitelistedUrls: updatedUrls });
  //       showMessage('success', 'URL removed successfully');
  //     } else {
  //       showMessage('error', 'Failed to remove URL');
  //     }
  //   } catch (err) {
  //     showMessage('error', 'Failed to remove URL');
  //     console.error('Remove URL error:', err);
  //   }
  // };

  const handleUpdateTimeLimit = async () => {
    setSaving(true);
    try {
      const success = await window.adminUpdateTimeLimit(timeLimit);
      if (success) {
        if (settings) {
          setSettings({ ...settings, sessionTimeLimit: timeLimit });
        }
        showMessage('success', 'Time limit updated successfully');
      } else {
        showMessage('error', 'Failed to update time limit');
      }
    } catch (err) {
      showMessage('error', 'Failed to update time limit');
      console.error('Update time limit error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSecurity = async () => {
    setSaving(true);
    try {
      const success = await window.adminUpdateSecurity({
        blockDevTools,
        blockTaskManager,
      });
      if (success) {
        if (settings) {
          setSettings({ ...settings, blockDevTools, blockTaskManager });
        }
        showMessage('success', 'Security settings updated successfully');
      } else {
        showMessage('error', 'Failed to update security settings');
      }
    } catch (err) {
      showMessage('error', 'Failed to update security settings');
      console.error('Update security error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateHardwareAcceleration = async () => {
    setSaving(true);
    try {
      const success = await window.adminUpdateHardwareAcceleration(enableHardwareAcceleration);
      if (success) {
        if (settings) {
          setSettings({ ...settings, enableHardwareAcceleration });
        }
        showMessage('success', 'Hardware acceleration updated. Please restart the app for changes to take effect.');
      } else {
        showMessage('error', 'Failed to update hardware acceleration');
      }
    } catch (err) {
      showMessage('error', 'Failed to update hardware acceleration');
      console.error('Update hardware acceleration error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAutoStart = async () => {
    setSaving(true);
    try {
      const success = await window.adminUpdateAutoStart(autoStartOnBoot);
      if (success) {
        if (settings) {
          setSettings({ ...settings, autoStartOnBoot });
        }
        showMessage('success', 'Startup settings updated successfully');
      } else {
        showMessage('error', 'Failed to update startup settings');
      }
    } catch (err) {
      showMessage('error', 'Failed to update startup settings');
      console.error('Update auto-start error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 4) {
      showMessage('error', 'Password must be at least 4 characters');
      return;
    }

    setSaving(true);
    try {
      const success = await window.adminChangePassword(oldPassword, newPassword);
      if (success) {
        showMessage('success', 'Password changed successfully');
        setShowPasswordChange(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showMessage('error', 'Invalid current password');
      }
    } catch (err) {
      showMessage('error', 'Failed to change password');
      console.error('Change password error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-dashboard-loading">Loading settings...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="dashboard-content">
        {/* Site Management - New comprehensive site management UI */}
        <section className="dashboard-section">
          <SiteManagement />
        </section>

        {/* Usage Statistics */}
        <section className="dashboard-section">
          <h2>Usage Statistics</h2>
          <p className="section-description">
            View and download usage data for sessions and games
          </p>

          {statsLoading ? (
            <div className="info-box">Loading statistics...</div>
          ) : usageStats ? (
            <>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Total Sessions</div>
                  <div className="stat-value">{usageStats.totalSessions}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Completed Sessions</div>
                  <div className="stat-value">{usageStats.completedSessions}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Total Games</div>
                  <div className="stat-value">{usageStats.totalGames}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Completed Games</div>
                  <div className="stat-value">{usageStats.completedGames}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Total Session Time</div>
                  <div className="stat-value">{formatTime(usageStats.totalSessionTime)}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Total Game Time</div>
                  <div className="stat-value">{formatTime(usageStats.totalGameTime)}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Avg Session Time</div>
                  <div className="stat-value">{formatTime(usageStats.averageSessionTime)}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Avg Game Time</div>
                  <div className="stat-value">{formatTime(usageStats.averageGameTime)}</div>
                </div>
              </div>

              <div className="button-group">
                <button onClick={handleDownloadCSV}>
                  Download CSV Report
                </button>
                <button onClick={loadUsageStats} className="secondary-button">
                  Refresh Statistics
                </button>
              </div>
            </>
          ) : (
            <div className="info-box">No statistics available</div>
          )}
        </section>

        {/* Session Time Limit */}
        <section className="dashboard-section">
          <h2>Session Time Limit</h2>
          <p className="section-description">
            Set how long each session can last (0 = unlimited)
          </p>

          <div className="time-limit-form">
            <input
              type="number"
              min="0"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
            />
            <span className="unit">minutes</span>
            <button onClick={handleUpdateTimeLimit} disabled={saving}>
              {saving ? 'Saving...' : 'Update'}
            </button>
          </div>

          {timeLimit === 0 && (
            <div className="info-box">
              Unlimited session time is currently set
            </div>
          )}
          {timeLimit > 0 && (
            <div className="info-box">
              Sessions will automatically close after {timeLimit} minute{timeLimit !== 1 ? 's' : ''}
            </div>
          )}
        </section>

        {/* Security Settings */}
        <section className="dashboard-section">
          <h2>Security Settings</h2>
          <p className="section-description">
            Control access to developer tools and system features
          </p>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={blockDevTools}
                onChange={(e) => setBlockDevTools(e.target.checked)}
              />
              <span>Block DevTools (F12, Inspect Element)</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={blockTaskManager}
                onChange={(e) => setBlockTaskManager(e.target.checked)}
              />
              <span>Block Task Manager (Ctrl+Shift+Esc, Ctrl+Alt+Del)</span>
            </label>
          </div>

          <button onClick={handleUpdateSecurity} disabled={saving}>
            {saving ? 'Saving...' : 'Update Security Settings'}
          </button>
        </section>

        {/* Hardware Acceleration */}
        <section className="dashboard-section">
          <h2>Performance Settings</h2>
          <p className="section-description">
            Configure graphics and performance options
          </p>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={enableHardwareAcceleration}
                onChange={(e) => setEnableHardwareAcceleration(e.target.checked)}
              />
              <span>Enable Hardware Acceleration (Recommended)</span>
            </label>
          </div>

          {!enableHardwareAcceleration && (
            <div className="warning-box">
              Warning: Disabling hardware acceleration will significantly reduce performance.
              Only disable if experiencing graphics issues or crashes.
            </div>
          )}

          <div className="info-box">
            App restart required for changes to take effect.
          </div>

          <button onClick={handleUpdateHardwareAcceleration} disabled={saving}>
            {saving ? 'Saving...' : 'Update Performance Settings'}
          </button>
        </section>

        {/* Auto-Start Settings */}
        <section className="dashboard-section">
          <h2>Startup Settings</h2>
          <p className="section-description">
            Configure whether the app launches automatically when the system starts
          </p>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={autoStartOnBoot}
                onChange={(e) => setAutoStartOnBoot(e.target.checked)}
              />
              <span>Launch app automatically on system startup (Recommended)</span>
            </label>
          </div>

          <button onClick={handleUpdateAutoStart} disabled={saving}>
            {saving ? 'Saving...' : 'Update Startup Settings'}
          </button>
        </section>

        {/* Password Management */}
        <section className="dashboard-section">
          <h2>Change Password</h2>
          <p className="section-description">
            Update your admin password
          </p>

          {!showPasswordChange ? (
            <button onClick={() => setShowPasswordChange(true)}>
              Change Password
            </button>
          ) : (
            <div className="password-change-form">
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Current password"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              <div className="button-group">
                <button onClick={handleChangePassword} disabled={saving}>
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  className="cancel-button"
                  onClick={() => {
                    setShowPasswordChange(false);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
