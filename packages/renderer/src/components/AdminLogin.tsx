import { type FC, useState } from 'react';
import './AdminLogin.css';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await window.adminLogin(password);
      if (success) {
        onLoginSuccess();
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Admin Login</h2>
        <p className="admin-login-description">
          Enter the admin password to access settings
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button type="submit" disabled={loading || !password}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              type="button"
              className="back-button"
              onClick={onCancel}
              disabled={loading}
            >
              ← Back
            </button>
          </div>
        </form>

        <div className="admin-login-note">
          Default password is "admin" if not changed
        </div>
      </div>
    </div>
  );
};
