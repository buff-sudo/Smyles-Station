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
import { ShutdownWarning } from './components/ShutdownWarning'
import type { SessionStatus } from './electron'

type View = 'session-prompt' | 'session-expired' | 'main' | 'admin-login' | 'admin-dashboard' | 'game-open'

const App: FC = () => {
  const [currentView, setCurrentView] = useState<View>('session-prompt')
  const [sessionActive, setSessionActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [showWarning, setShowWarning] = useState(false)
  const [showEmergencyExit, setShowEmergencyExit] = useState(false)
  const [shutdownWarning, setShutdownWarning] = useState<{shutdownTime: number; timeRemaining: number} | null>(null)

  // Setup session event listeners
  useEffect(() => {
    // Listen for session status updates (every second)
    const removeStatusListener = window.sessionOnStatus((status: SessionStatus) => {
      setTimeRemaining(status.timeRemaining)
    })

    // Listen for warning event
    const removeWarningListener = window.sessionOnWarning(() => {
      setShowWarning(true)
      // Auto-dismiss after 5 seconds
      setTimeout(() => setShowWarning(false), 5000)
    })

    // Listen for expiry event
    const removeExpiredListener = window.sessionOnExpired(() => {
      handleSessionExpired()
    })

    // Listen for emergency exit request
    const removeEmergencyExitListener = window.adminOnEmergencyExitRequested(() => {
      setShowEmergencyExit(true)
    })

    // Listen for shutdown warning
    window.shutdownOnWarning((data) => {
      setShutdownWarning(data)
    })

    // Listen for imminent shutdown
    window.shutdownOnImminent(() => {
      console.log('System shutdown imminent')
    })

    // Listen for shutdown failures
    window.shutdownOnFailed((error) => {
      console.error('Shutdown failed:', error)
      setShutdownWarning(null)
    })

    // Cleanup all listeners on unmount
    return () => {
      removeStatusListener()
      removeWarningListener()
      removeExpiredListener()
      removeEmergencyExitListener()
    }
  }, [])

  // Setup global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+A - Open Admin Dashboard
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        // If already in admin dashboard, ignore
        if (currentView === 'admin-dashboard') return
        // Navigate to admin login
        setCurrentView('admin-login')
      }

      // Ctrl+Shift+Q - Emergency Exit (requires password)
      if (e.ctrlKey && e.shiftKey && e.key === 'Q') {
        e.preventDefault()
        // Trigger emergency exit dialog
        setShowEmergencyExit(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentView])

  // Manage game view visibility based on dialogs and current view
  useEffect(() => {
    const shouldHideGame =
      showEmergencyExit ||
      currentView === 'admin-login' ||
      currentView === 'admin-dashboard'

    if (shouldHideGame) {
      window.hideGameView?.()
    } else if (currentView === 'game-open' || currentView === 'main') {
      // Only show game view when in game-open or main view (not session-prompt, etc.)
      window.showGameView?.()
    }
  }, [showEmergencyExit, currentView])

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
      <>
        {/* Emergency Exit Dialog - accessible from anywhere */}
        {showEmergencyExit && (
          <EmergencyExit onClose={() => setShowEmergencyExit(false)} />
        )}

        <SessionPrompt
          onStartSession={handleStartSession}
          onAdminClick={() => setCurrentView('admin-login')}
        />
      </>
    )
  }

  // Session Expired View
  if (currentView === 'session-expired') {
    return (
      <>
        {/* Emergency Exit Dialog - accessible from anywhere */}
        {showEmergencyExit && (
          <EmergencyExit onClose={() => setShowEmergencyExit(false)} />
        )}

        <SessionExpired />
      </>
    )
  }

  // Admin Login View
  if (currentView === 'admin-login') {
    return (
      <>
        {/* Emergency Exit Dialog - accessible from anywhere */}
        {showEmergencyExit && (
          <EmergencyExit onClose={() => setShowEmergencyExit(false)} />
        )}

        <AdminLogin
          onLoginSuccess={handleAdminLogin}
          onCancel={() => setCurrentView('session-prompt')}
        />
      </>
    )
  }

  // Admin Dashboard View
  if (currentView === 'admin-dashboard') {
    return (
      <>
        {/* Emergency Exit Dialog - accessible from anywhere */}
        {showEmergencyExit && (
          <EmergencyExit onClose={() => setShowEmergencyExit(false)} />
        )}

        <AdminDashboard onLogout={handleAdminLogout} />
      </>
    )
  }

  // Game Open View (minimal header while game plays)
  if (currentView === 'game-open') {
    return (
      <>
        {/* Emergency Exit Dialog - highest priority overlay */}
        {showEmergencyExit && (
          <EmergencyExit onClose={() => setShowEmergencyExit(false)} />
        )}

        {/* Shutdown Warning - highest priority */}
        {shutdownWarning && (
          <ShutdownWarning shutdownTime={shutdownWarning.shutdownTime} />
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

      {/* Shutdown Warning - highest priority */}
      {shutdownWarning && (
        <ShutdownWarning shutdownTime={shutdownWarning.shutdownTime} />
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