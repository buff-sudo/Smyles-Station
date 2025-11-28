import { type FC } from 'react';
import './SessionWarning.css';

interface SessionWarningProps {
  timeRemaining: number; // milliseconds
}

export const SessionWarning: FC<SessionWarningProps> = ({ timeRemaining }) => {
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    return `${totalSeconds} second${totalSeconds !== 1 ? 's' : ''}`;
  };

  return (
    <div className="session-warning-overlay">
      <div className="session-warning-card">
        <div className="session-warning-icon">⚠️</div>
        <h2 className="session-warning-title">Session Ending Soon!</h2>
        <p className="session-warning-message">
          Your session will end in <strong>{formatTime(timeRemaining)}</strong>
        </p>
        <p className="session-warning-note">
          All windows will close automatically when the session expires
        </p>
      </div>
    </div>
  );
};
