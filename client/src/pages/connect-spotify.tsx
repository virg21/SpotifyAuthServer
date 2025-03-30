import React from 'react';
import { useLocation } from 'wouter';
import MobileLayout from '@/components/MobileLayout';

const ConnectSpotifyPage = () => {
  const [location, setLocation] = useLocation();
  
  const handleConnectSpotify = () => {
    // Redirect to our API endpoint that will handle the Spotify OAuth flow
    window.location.href = '/api/auth/login';
  };
  
  return (
    <MobileLayout showNav={false} back={true} onBack={() => setLocation('/')}>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="mb-6 w-full">
          <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-green-500 w-full aspect-square rounded-lg flex items-center justify-center mb-6">
            <svg 
              viewBox="0 0 24 24" 
              width="80" 
              height="80" 
              className="text-black"
              fill="currentColor"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Connect your Spotify</h1>
          <p className="text-neutral-600 mb-6">
            Discover local music events tailored to your Spotify listening history.
            We'll analyze your favorite artists and genres to find perfect matches.
          </p>
        </div>
        
        <button 
          onClick={handleConnectSpotify}
          className="btn-spotify"
        >
          Connect with Spotify
        </button>
      </div>
    </MobileLayout>
  );
};

export default ConnectSpotifyPage;