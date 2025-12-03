import { type FC, useState, useEffect } from 'react';
import type { SessionStatus } from '../electron';
import './HeaderWindow.css';

export const HeaderWindow: FC = () => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [sessionActive, setSessionActive] = useState(false);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isUnlimited = timeRemaining <= 0;
  const isWarning = !isUnlimited && timeRemaining < 60000; // Less than 1 minute

  // Subscribe to session events
  useEffect(() => {
    window.sessionOnStatus((status: SessionStatus) => {
      setTimeRemaining(status.timeRemaining);
      setSessionActive(status.isActive);
    });
  }, []);

  const handleExit = () => {
    if (window.closeCurrentWindow) {
      window.closeCurrentWindow();
    }
  };

  return (
    <div className={`header-window ${isWarning ? 'header-window-warning' : ''}`}>
      {/* Left: Session Timer */}
      <div className="header-left">
        {sessionActive && !isUnlimited && (
          <div className="header-timer">
            <div className="header-timer-label">Time Remaining</div>
            <div className="header-timer-value">{formatTime(timeRemaining)}</div>
          </div>
        )}
      </div>

      {/* Right: Exit Button */}
      <div className="header-right">
        <button
          className="header-exit-button"
          onClick={handleExit}
          title="Exit and return to main screen"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
