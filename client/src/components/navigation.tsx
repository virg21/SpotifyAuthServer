import React from 'react';
import { useLocation } from 'wouter';
import { Home, Search, Map, Music, User } from 'lucide-react';

const Navigation: React.FC = () => {
  const [location, setLocation] = useLocation();
  
  // Don't show navigation on certain pages
  if (
    location === '/' || 
    location === '/connect-spotify' || 
    location === '/auth-success' ||
    location === '/analyzing-music'
  ) {
    return null;
  }
  
  const isActive = (path: string) => location === path;
  
  return (
    <nav className="nav-bottom">
      <a 
        href="#" 
        onClick={(e) => { e.preventDefault(); setLocation('/home'); }} 
        className={`nav-item ${isActive('/home') ? 'active' : ''}`}
        aria-label="Home"
      >
        <Home size={20} />
      </a>
      <a 
        href="#" 
        onClick={(e) => { e.preventDefault(); setLocation('/events'); }} 
        className={`nav-item ${isActive('/events') ? 'active' : ''}`}
        aria-label="Events"
      >
        <Search size={20} />
      </a>
    </nav>
  );
};

export default Navigation;