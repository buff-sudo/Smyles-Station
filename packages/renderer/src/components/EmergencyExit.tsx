import { type FC, useState, useEffect } from 'react';
import './EmergencyExit.css';

interface EmergencyExitProps {
  onClose: () => void;
}

export const EmergencyExit: FC<EmergencyExitProps> = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempting, setAttempting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setAttempting(true);
    setError('');

    try {
      const isValid = await window.adminVerifyEmergencyExit(password);

      if (!isValid) {
        setError('Invalid admin password');
        setPassword('');
        setAttempting(false);
      }
      // If valid, app will quit - no need to update UI
    } catch (err) {
      setError('Failed to verify password');
      setAttempting(false);
    }
  };

  const handleCancel = () => {
    setPassword('');
    setError('');
    onClose();
  };

  // Auto-focus password input and ensure window has focus
  useEffect(() => {
    const focusInput = async () => {
      // First, ensure the main window has focus
      await window.windowFocus?.();
      // Then focus the password input
      const input = document.getElementById('emergency-password');
      if (input) {
        (input as HTMLInputElement).focus();
      }
    };
    focusInput();
  }, []);

  return (
    <div className="emergency-exit-overlay">
      <div className="emergency-exit-dialog">
        <h2>Emergency Exit</h2>
        <p className="warning-text">
          Enter admin password to exit the application
        </p>

        <form onSubmit={handleSubmit}>
          <input
            id="emergency-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            disabled={attempting}
            autoComplete="off"
          />

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button
              type="submit"
              disabled={!password.trim() || attempting}
              className="submit-button"
            >
              {attempting ? 'Verifying...' : 'Exit Application'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={attempting}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </form>

        <p className="hint-text">
          Keyboard shortcut: Ctrl+Shift+Q
        </p>
      </div>
    </div>
  );
};
