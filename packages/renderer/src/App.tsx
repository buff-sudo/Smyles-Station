import './App.css'
import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { AdminLogin } from './components/AdminLogin'
import { AdminDashboard } from './components/AdminDashboard'
import { SessionPrompt } from './components/SessionPrompt'
import { SessionTimer } from './components/SessionTimer'
import { SessionWarning } from './components/SessionWarning'
import { SessionExpired } from './components/SessionExpired'
import { WebsiteGrid } from './components/WebsiteGrid'
import { EmergencyExit } from './components/EmergencyExit'
import type { SessionStatus } from './electron'

type View = 'session-prompt' | 'session-expired' | 'main' | 'admin-login' | 'admin-dashboard' | 'game-open'

const App: FC = () => {
  const [currentView, setCurrentView] = useState<View>('session-prompt')
  const [sessionActive, setSessionActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [showWarning, setShowWarning] = useState(false)
  const [showEmergencyExit, setShowEmergencyExit] = useState(false)

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

    // Listen for emergency exit request
    window.adminOnEmergencyExitRequested(() => {
      setShowEmergencyExit(true)
    })
  }, [])

  const handleOpenWindow = async (url: string, siteName: string) => {
    if (window.openNewWindow) {
      try {
        const windowId = await window.openNewWindow(url, siteName);
        console.log(`Opened ${siteName} in window ID: ${windowId}`);
        // Switch to game-open view to show minimal header
        setCurrentView('game-open');
      } catch (error) {
        console.error(`Failed to open ${siteName}:`, error);
      }
    }
  };

  const handleExitGame = async () => {
    try {
      await window.closeCurrentWindow();
      // Switch back to main view
      setCurrentView('main');
    } catch (error) {
      console.error('Failed to exit game:', error);
    }
  };

  const handleAdminLogin = () => {
    setCurrentView('admin-dashboard')
  }

  const handleAdminLogout = () => {
    setCurrentView('session-prompt')
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
    /*setTimeout(() => {
      setCurrentView('session-prompt')
    }, 3000)*/
  }


  

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
    return (
      <AdminLogin
        onLoginSuccess={handleAdminLogin}
        onCancel={() => setCurrentView('session-prompt')}
      />
    )
  }

  // Admin Dashboard View
  if (currentView === 'admin-dashboard') {
    return <AdminDashboard onLogout={handleAdminLogout} />
  }

  // Game Open View (minimal header while game plays)
  if (currentView === 'game-open') {
    return (
      <>
        {/* Emergency Exit Dialog - highest priority overlay */}
        {showEmergencyExit && (
          <EmergencyExit onClose={() => setShowEmergencyExit(false)} />
        )}

        {/* Session Timer (visible when session is active) */}
        {sessionActive && (
          <SessionTimer
            timeRemaining={timeRemaining}
            onEndSession={handleEndSession}
          />
        )}

        {/* Session Warning Modal */}
        {showWarning && (
          <SessionWarning timeRemaining={timeRemaining} />
        )}

        {/* Exit Game Button */}
        <button
          className="exit-game-button"
          onClick={handleExitGame}
          title="Exit game and return to selection"
        >
          ✕ Exit Game
        </button>
      </>
    );
  }

  // Main View (website selection)
  return (
    <>
      {/* Emergency Exit Dialog - highest priority overlay */}
      {showEmergencyExit && (
        <EmergencyExit onClose={() => setShowEmergencyExit(false)} />
      )}

      {/* Session Timer (visible when session is active) */}
      {sessionActive && (
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
        <WebsiteGrid onOpenSite={handleOpenWindow} />
      </div>
    </>
  );
};

export default App