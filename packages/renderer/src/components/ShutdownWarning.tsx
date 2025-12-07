import {type FC, useState, useEffect} from 'react';
import './ShutdownWarning.css';

interface ShutdownWarningProps {
  shutdownTime: number; // Unix timestamp
}

export const ShutdownWarning: FC<ShutdownWarningProps> = ({shutdownTime}) => {
  const [timeRemaining, setTimeRemaining] = useState(shutdownTime - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(shutdownTime - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [shutdownTime]);

  const formatTimeRemaining = (ms: number): string => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${
        seconds !== 1 ? 's' : ''
      }`;
    }
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  };

  return (
    <div className="shutdown-warning-overlay">
      <div className="shutdown-warning-card">
        <div className="shutdown-warning-icon">🔌</div>
        <h2 className="shutdown-warning-title">System Shutdown Scheduled</h2>
        <p className="shutdown-warning-message">
          This computer will automatically shut down in:
        </p>
        <div className="shutdown-countdown">{formatTimeRemaining(timeRemaining)}</div>
        <p className="shutdown-warning-note">
          Please save any work and close all applications. This shutdown cannot be cancelled.
        </p>
      </div>
    </div>
  );
};
