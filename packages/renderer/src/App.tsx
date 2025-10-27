import './App.css'
import type { FC } from 'react'

const App: FC = () => {
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

  return (
    <div className="app-container">
      <h1>Electron App</h1>
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