import React, { FC, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, Home, Search, Compass } from 'lucide-react';

interface StatusBarProps {
  time?: string;
}

export const StatusBar: FC<StatusBarProps> = ({ time = '12:00' }) => {
  return (
    <div className="status-bar">
      <div>{time}</div>
      <div className="flex space-x-1">
        <span>●</span>
        <span>●</span>
        <span>●</span>
      </div>
    </div>
  );
};

interface AppHeaderProps {
  title?: string;
  back?: boolean;
  onBack?: () => void;
}

export const AppHeader: FC<AppHeaderProps> = ({ title = 'Quincy', back = false, onBack }) => {
  return (
    <header className="app-header">
      {back && (
        <button 
          onClick={onBack} 
          className="absolute left-4 text-neutral-800"
          aria-label="Go back"
        >
          <ChevronLeft size={24} />
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
  const [, setLocation] = useLocation();
  
  return (
    <nav className="nav-bottom">
      <a 
        href="#" 
        onClick={(e) => { e.preventDefault(); setLocation('/home'); }} 
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
      >
        <Home size={24} />
      </a>
      <a 
        href="#" 
        onClick={(e) => { e.preventDefault(); setLocation('/events'); }} 
        className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
      >
        <Search size={24} />
      </a>
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
  time?: string;
}

const MobileLayout: FC<MobileLayoutProps> = ({
  children,
  showHeader = true,
  showNav = false,
  showStatusBar = true,
  title,
  activeTab,
  back = false,
  onBack,
  time
}) => {
  const [, setLocation] = useLocation();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };
  
  return (
    <div className="mobile-container">
      {showStatusBar && <StatusBar time={time} />}
      {showHeader && <AppHeader title={title} back={back} onBack={handleBack} />}
      <main className="app-content">
        {children}
      </main>
      {showNav && <BottomNav activeTab={activeTab} />}
    </div>
  );
};

export default MobileLayout;