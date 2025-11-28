import { type FC } from 'react';
import './SessionExpired.css';

export const SessionExpired: FC = () => {
  return (
    <div className="session-expired-container">
      <div className="session-expired-card">
        <div className="session-expired-icon">🕒</div>
        <h1>Session Ended</h1>
        <p className="session-expired-description">
          Your session time has expired
        </p>
        <div className="session-expired-info">
          All windows have been closed. You will be returned to the start screen shortly.
        </div>
      </div>
    </div>
  );
};
