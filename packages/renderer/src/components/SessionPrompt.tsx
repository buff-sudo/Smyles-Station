import { type FC, useState, useEffect, useRef } from 'react';
import './SessionPrompt.css';

interface SessionPromptProps {
  onStartSession: () => void;
  onAdminClick: () => void;
}

export const SessionPrompt: FC<SessionPromptProps> = ({ onStartSession, onAdminClick }) => {
  const [sessionTimeLimit, setSessionTimeLimit] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Load session time limit from admin config
    const loadSettings = async () => {
      try {
        const settings = await window.adminGetSettings();
        if (settings) {
          setSessionTimeLimit(settings.sessionTimeLimit);
        }
      } catch (error) {
        console.error('Failed to load session settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Handle click outside to close settings menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSettingsMenu &&
        menuRef.current &&
        settingsButtonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !settingsButtonRef.current.contains(event.target as Node)
      ) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettingsMenu]);

  // Handle ESC key to close password dialog
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showPasswordDialog) {
        handleCancelPassword();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showPasswordDialog]);

  const handleSettingsClick = () => {
    setShowSettingsMenu(!showSettingsMenu);
  };

  const handleAdminSettingsClick = () => {
    setShowSettingsMenu(false);
    onAdminClick();
  };

  const handleCloseAppClick = () => {
    setShowSettingsMenu(false);
    setShowPasswordDialog(true);
    setPassword('');
    setPasswordError('');
  };

  const handleCancelPassword = () => {
    setShowPasswordDialog(false);
    setPassword('');
    setPasswordError('');
    setIsClosing(false);
  };

  const handleCloseApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setIsClosing(true);

    try {
      const isValid = await window.adminLogin(password);
      if (isValid) {
        await window.closeCurrentWindow();
      } else {
        setPasswordError('Incorrect password');
        setIsClosing(false);
      }
    } catch (error) {
      console.error('Failed to close app:', error);
      setPasswordError('An error occurred');
      setIsClosing(false);
    }
  };

  const formatTimeLimit = (minutes: number): string => {
    if (minutes === 0) return 'Unlimited';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="session-prompt-container">
      <div className="session-prompt-card">
        <button
          className="start-session-button"
          onClick={onStartSession}
          disabled={loading}
        >
          <span className="button-icon">{loading ? '⏳' : '▶'}</span>
        </button>
      </div>

      {/* Settings button fixed at bottom-center */}
      <button
        ref={settingsButtonRef}
        className="settings-button"
        onClick={handleSettingsClick}
        aria-label="Settings"
      >
        ⚙️
      </button>

      {/* Settings menu dropdown */}
      {showSettingsMenu && (
        <div ref={menuRef} className="settings-menu">
          <button
            className="settings-menu-item"
            onClick={handleAdminSettingsClick}
          >
            Admin Settings
          </button>
          <button
            className="settings-menu-item"
            onClick={handleCloseAppClick}
          >
            Close Application
          </button>
        </div>
      )}

      {/* Password dialog for closing app */}
      {showPasswordDialog && (
        <div className="password-dialog-overlay">
          <div className="password-dialog">
            <h2>Close Application</h2>
            <p>Enter admin password to close the application</p>

            <form onSubmit={handleCloseApp}>
              <div className="password-input-group">
                <label htmlFor="close-app-password">Password</label>
                <input
                  id="close-app-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isClosing}
                  autoFocus
                />
              </div>

              {passwordError && (
                <div className="password-error">{passwordError}</div>
              )}

              <div className="password-dialog-buttons">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancelPassword}
                  disabled={isClosing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="close-app-button"
                  disabled={isClosing || !password}
                >
                  {isClosing ? 'Closing...' : 'Close App'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
