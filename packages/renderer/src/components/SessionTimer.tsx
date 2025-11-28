import { type FC } from 'react';
import './SessionTimer.css';

interface SessionTimerProps {
  timeRemaining: number; // milliseconds
  onEndSession: () => void;
}

export const SessionTimer: FC<SessionTimerProps> = ({ timeRemaining, onEndSession }) => {
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isWarning = timeRemaining < 60000; // Less than 1 minute

  return (
    <div className={`session-timer ${isWarning ? 'session-timer-warning' : ''}`}>
      <div className="session-timer-content">
        <div className="session-timer-label">Time Remaining</div>
        <div className="session-timer-value">{formatTime(timeRemaining)}</div>
      </div>
      <button
        className="session-timer-end-button"
        onClick={onEndSession}
        title="End Session"
      >
        End Session
      </button>
    </div>
  );
};
