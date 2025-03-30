import React from 'react';
import { useLocation } from 'wouter';
import MobileLayout from '@/components/MobileLayout';

const ConnectSpotifyPage = () => {
  const [location, setLocation] = useLocation();
  
  const handleConnectSpotify = () => {
    // Redirect to our API endpoint that will handle the Spotify OAuth flow
    window.location.href = '/api/auth/login';
  };
  
  // Get current time for the status bar
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <MobileLayout 
      showNav={false} 
      back={false} 
      title="ShiipMusic" 
      showStatusBar={true}
      time={getCurrentTime()}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <div className="mb-6 w-full">
          {/* Background image similar to the provided design */}
          <div className="bg-gradient-to-br from-pink-400 via-purple-500 to-green-400 w-full aspect-square flex items-center justify-center mb-6">
            {/* Spotify logo */}
            <div className="bg-black rounded-full w-32 h-32 flex items-center justify-center">
              <svg 
                viewBox="0 0 24 24" 
                width="80" 
                height="80" 
                className="text-[#1DB954]"
                fill="currentColor"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Connect your Spotify</h1>
          
          {/* Lines mimicking text from the design */}
          <div className="mb-6 space-y-2">
            <div className="h-2 bg-gray-200 rounded w-full"></div>
            <div className="h-2 bg-gray-200 rounded w-11/12"></div>
            <div className="h-2 bg-gray-200 rounded w-10/12"></div>
            <div className="h-2 bg-gray-200 rounded w-4/12"></div>
          </div>
        </div>
        
        {/* Spotify connect button */}
        <button 
          onClick={handleConnectSpotify}
          className="w-full py-3 px-6 bg-neutral-700 hover:bg-neutral-800 text-white font-medium rounded-md transition-colors duration-200 mb-4"
        >
          Connect with Spotify
        </button>
      </div>
    </MobileLayout>
  );
};

export default ConnectSpotifyPage;