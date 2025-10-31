import './App.css'
import type { FC } from 'react'
import { useState } from 'react'
import { AdminLogin } from './components/AdminLogin'
import { AdminDashboard } from './components/AdminDashboard'

type View = 'main' | 'admin-login' | 'admin-dashboard'

const App: FC = () => {
  const [currentView, setCurrentView] = useState<View>('main')

  const handleOpenWindow = async (url: string, siteName: string) => {
    if (window.openNewWindow) {
      try {
        const windowId = await window.openNewWindow(url);
        console.log(`Opened ${siteName} in window ID: ${windowId}`);
      } catch (error) {
        console.error(`Failed to open ${siteName}:`, error);
      }
    }
  };

  const handleAdminLogin = () => {
    setCurrentView('admin-dashboard')
  }

  const handleAdminLogout = () => {
    setCurrentView('main')
  }

  if (currentView === 'admin-login') {
    return <AdminLogin onLoginSuccess={handleAdminLogin} />
  }

  if (currentView === 'admin-dashboard') {
    return <AdminDashboard onLogout={handleAdminLogout} />
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Electron App</h1>
        <button
          className="admin-access-button"
          onClick={() => setCurrentView('admin-login')}
        >
          Admin
        </button>
      </div>

      <p>Choose a site to open:</p>

      <button onClick={() => handleOpenWindow('https://pbskids.org/games', 'PBS Kids')}>
        Open PBS Kids Games
      </button>

      <button onClick={() => handleOpenWindow('https://www.abcmouse.com/library_account', 'ABC Mouse')}>
        Open ABC Mouse
      </button>
    </div>
  );
};

export default App