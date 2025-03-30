import React, { FC, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';

interface StatusBarProps {
  time?: string;
}

export const StatusBar: FC<StatusBarProps> = ({ time = '10:45' }) => {
  return (
    <div className="status-bar">
      <div>{time}</div>
      <div className="flex space-x-1">
        <div className="h-2 w-2 rounded-full bg-neutral-800"></div>
        <div className="h-2 w-2 rounded-full bg-neutral-500"></div>
        <div className="h-2 w-2 rounded-full bg-neutral-800"></div>
      </div>
    </div>
  );
};

interface AppHeaderProps {
  title?: string;
  back?: boolean;
  onBack?: () => void;
}

export const AppHeader: FC<AppHeaderProps> = ({ 
  title = 'ShiipMusic', 
  back = false,
  onBack
}) => {
  return (
    <header className="app-header">
      {back && (
        <button 
          onClick={onBack} 
          className="absolute left-4 text-neutral-800"
          aria-label="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <h1 className="app-logo">{title}</h1>
    </header>
  );
};

interface BottomNavProps {
  activeTab?: 'home' | 'search' | 'explore';
}

export const BottomNav: FC<BottomNavProps> = ({ activeTab = 'home' }) => {
  return (
    <nav className="nav-bottom">
      <Link href="/">
        <a className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="mt-1">Home</span>
        </a>
      </Link>
      <Link href="/search">
        <a className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="mt-1">Search</span>
        </a>
      </Link>
      <Link href="/explore">
        <a className={`nav-item ${activeTab === 'explore' ? 'active' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          <span className="mt-1">Explore</span>
        </a>
      </Link>
    </nav>
  );
};

interface MobileLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  showStatusBar?: boolean;
  title?: string;
  activeTab?: 'home' | 'search' | 'explore';
  back?: boolean;
  onBack?: () => void;
}

const MobileLayout: FC<MobileLayoutProps> = ({
  children,
  showHeader = true,
  showNav = false,
  showStatusBar = true,
  title,
  activeTab,
  back = false,
  onBack
}) => {
  const [location, setLocation] = useLocation();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };
  
  return (
    <div className="mobile-container">
      {showStatusBar && <StatusBar />}
      {showHeader && <AppHeader title={title} back={back} onBack={handleBack} />}
      <main className="app-content">
        {children}
      </main>
      {showNav && <BottomNav activeTab={activeTab} />}
    </div>
  );
};

export default MobileLayout;