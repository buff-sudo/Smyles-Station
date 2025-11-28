import { type FC, useState, useEffect } from 'react';
import './SessionPrompt.css';

interface SessionPromptProps {
  onStartSession: () => void;
  onAdminClick: () => void;
}

export const SessionPrompt: FC<SessionPromptProps> = ({ onStartSession, onAdminClick }) => {
  const [sessionTimeLimit, setSessionTimeLimit] = useState<number>(0);
  const [loading, setLoading] = useState(true);

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
        <h1>Welcome</h1>
        <p className="session-prompt-description">
          Click the button below to start your session
        </p>

        {!loading && sessionTimeLimit > 0 && (
          <div className="session-info">
            <div className="session-info-label">Session Time Limit:</div>
            <div className="session-info-value">{formatTimeLimit(sessionTimeLimit)}</div>
          </div>
        )}

        <button
          className="start-session-button"
          onClick={onStartSession}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Start Session'}
        </button>

        <button
          className="admin-access-button"
          onClick={onAdminClick}
        >
          Admin
        </button>
      </div>
    </div>
  );
};
