import './App.css'
import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { AdminLogin } from './components/AdminLogin'
import { AdminDashboard } from './components/AdminDashboard'
import { SessionPrompt } from './components/SessionPrompt'
import { SessionTimer } from './components/SessionTimer'
import { SessionWarning } from './components/SessionWarning'
import { SessionExpired } from './components/SessionExpired'
import type { SessionStatus } from './electron'

type View = 'session-prompt' | 'session-expired' | 'main' | 'admin-login' | 'admin-dashboard'

const App: FC = () => {
  const [currentView, setCurrentView] = useState<View>('session-prompt')
  const [sessionActive, setSessionActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [showWarning, setShowWarning] = useState(false)
  const [sessionTimeLimit, setSessionTimeLimit] = useState<number>(0)

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
    // Return to session prompt if no session is active, otherwise return to main
    if (sessionActive) {
      setCurrentView('main')
    } else {
      setCurrentView('session-prompt')
    }
  }

  const handleStartSession = async () => {
    try {
      await window.sessionStart()
      setSessionActive(true)
      setCurrentView('main')
    } catch (error) {
      console.error('Failed to start session:', error)
    }
  }

  const handleEndSession = async () => {
    try {
      await window.sessionEnd()
      setSessionActive(false)
      setShowWarning(false)
      setCurrentView('session-prompt')
    } catch (error) {
      console.error('Failed to end session:', error)
    }
  }

  const handleSessionExpired = () => {
    setSessionActive(false)
    setShowWarning(false)
    setCurrentView('session-expired')
    // Auto-transition to session prompt after 3 seconds
    setTimeout(() => {
      setCurrentView('session-prompt')
    }, 3000)
  }

  // Check if unlimited mode (sessionTimeLimit = 0) on mount
  useEffect(() => {
    const checkSessionMode = async () => {
      try {
        const settings = await window.adminGetSettings()
        if (settings) {
          setSessionTimeLimit(settings.sessionTimeLimit)
          // If unlimited mode, skip session prompt and go directly to main
          if (settings.sessionTimeLimit === 0) {
            setCurrentView('main')
          }
        }
      } catch (error) {
        console.error('Failed to load session settings:', error)
      }
    }

    checkSessionMode()
  }, [])

  // Setup session event listeners
  useEffect(() => {
    // Listen for session status updates (every second)
    window.sessionOnStatus((status: SessionStatus) => {
      setTimeRemaining(status.timeRemaining)
    })

    // Listen for warning event
    window.sessionOnWarning(() => {
      setShowWarning(true)
      // Auto-dismiss after 5 seconds
      setTimeout(() => setShowWarning(false), 5000)
    })

    // Listen for expiry event
    window.sessionOnExpired(() => {
      handleSessionExpired()
    })
  }, [])

  // Session Prompt View
  if (currentView === 'session-prompt') {
    return (
      <SessionPrompt
        onStartSession={handleStartSession}
        onAdminClick={() => setCurrentView('admin-login')}
      />
    )
  }

  // Session Expired View
  if (currentView === 'session-expired') {
    return <SessionExpired />
  }

  // Admin Login View
  if (currentView === 'admin-login') {
    return <AdminLogin onLoginSuccess={handleAdminLogin} />
  }

  // Admin Dashboard View
  if (currentView === 'admin-dashboard') {
    return <AdminDashboard onLogout={handleAdminLogout} />
  }

  // Main View (website selection)
  return (
    <>
      {/* Session Timer (visible when session is active) */}
      {sessionActive && sessionTimeLimit > 0 && (
        <SessionTimer
          timeRemaining={timeRemaining}
          onEndSession={handleEndSession}
        />
      )}

      {/* Session Warning Modal */}
      {showWarning && (
        <SessionWarning timeRemaining={timeRemaining} />
      )}

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
    </>
  );
};

export default App