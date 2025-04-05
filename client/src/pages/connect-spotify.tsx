import React, { useState } from 'react';
import { useLocation } from 'wouter';
import MobileLayout from '@/components/MobileLayout';
import { Music, Headphones, Calendar, MapPin } from 'lucide-react';

const ConnectSpotify: React.FC = () => {
  const [, setLocation] = useLocation();
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Get current time for the status bar
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const handleConnectSpotify = () => {
    setIsConnecting(true);
    
    // For demo purposes, we'll just simulate the Spotify connection
    // and redirect to the analyzing music page after a brief delay
    setTimeout(() => {
      setLocation('/analyzing-music');
    }, 1500);
  };
  
  const handleSkip = () => {
    // Go to the events page without connecting to Spotify
    setLocation('/events');
  };
  
  return (
    <MobileLayout 
      showNav={false} 
      back={true} 
      title="Quincy" 
      showStatusBar={true}
      time={getCurrentTime()}
    >
      <div className="flex flex-col items-center justify-start h-full">
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
          
          <h1 className="text-2xl font-bold mb-3 text-center">Connect Your Spotify</h1>
          <p className="text-neutral-600 text-center mb-8">
            Get personalized event recommendations based on your music taste
          </p>
          
          {/* Benefits of connecting */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start">
              <div className="mt-1 mr-4 bg-green-100 p-2 rounded-full">
                <Music className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-800">Personalized Music Insights</h3>
                <p className="text-sm text-neutral-600">
                  Discover your unique music personality and listening habits
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 mr-4 bg-blue-100 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-800">Tailored Event Recommendations</h3>
                <p className="text-sm text-neutral-600">
                  Find concerts and events matching your favorite genres and artists
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 mr-4 bg-purple-100 p-2 rounded-full">
                <Headphones className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-800">Custom Playlists for Events</h3>
                <p className="text-sm text-neutral-600">
                  Get exclusive playlists tailored to local music events
                </p>
              </div>
            </div>
          </div>
          
          {/* Connect button */}
          <button 
            onClick={handleConnectSpotify} 
            disabled={isConnecting}
            className="btn-spotify"
          >
            {isConnecting ? 'Connecting...' : 'Connect with Spotify'}
          </button>
          
          {/* Skip option */}
          <div className="text-center">
            <button 
              onClick={handleSkip}
              className="text-neutral-500 text-sm font-medium"
            >
              Skip for now
            </button>
            <p className="text-xs text-neutral-400 mt-1">
              You can always connect later
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default ConnectSpotify;