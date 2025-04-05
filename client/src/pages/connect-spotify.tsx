import React, { useState } from 'react';
import { useLocation } from 'wouter';
import MobileLayout from '@/components/MobileLayout';
import { Music, Users, Calendar } from 'lucide-react';

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
        <div className="w-full">
          {/* Background image similar to the provided design */}
          <div className="bg-gradient-to-br from-purple-500 via-pink-400 to-green-400 w-full aspect-video rounded-xl mb-10 flex items-center justify-center">
            {/* Spotify logo */}
            <div className="bg-black rounded-full w-28 h-28 flex items-center justify-center">
              <svg 
                viewBox="0 0 24 24" 
                width="70" 
                height="70" 
                className="text-[#1DB954]"
                fill="currentColor"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-center text-white">Connect Your Spotify</h1>
          <p className="text-white/80 text-center mb-8">
            Get personalized event recommendations in your city based on your music taste
          </p>
          
          {/* Benefits of connecting */}
          <div className="space-y-6 mb-10">
            <div className="flex items-start p-4 rounded-xl border border-[var(--app-primary)] bg-white/5">
              <div className="mt-1 mr-4 bg-white/10 p-2 rounded-full">
                <Music className="h-5 w-5 text-[var(--app-primary)]" />
              </div>
              <div>
                <h3 className="font-medium text-white">Your Music Taste, but Localized</h3>
                <p className="text-sm text-white/80">Get wild facts about how your favorite artists and genres connect to your city. It's giving "how did they know that?"</p>
              </div>
            </div>
            
            <div className="flex items-start p-4 rounded-xl border border-[var(--app-primary)] bg-white/5">
              <div className="mt-1 mr-4 bg-white/10 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-[var(--app-primary)]" />
              </div>
              <div>
                <h3 className="font-medium text-white">Events & Experiences You'll Actually Want to Go To</h3>
                <p className="text-sm text-white/80">We pull concerts in your vibe zone — no random shows, just hidden experiences you need to be at.</p>
              </div>
            </div>
            
            <div className="flex items-start p-4 rounded-xl border border-[var(--app-primary)] bg-white/5">
              <div className="mt-1 mr-4 bg-white/10 p-2 rounded-full">
                <Users className="h-5 w-5 text-[var(--app-primary)]" />
              </div>
              <div>
                <h3 className="font-medium text-white">Meet People Who Get Your Music</h3>
                <p className="text-sm text-white/80">Link up with locals who stan the same artists. Music soulmates? Maybe.</p>
              </div>
            </div>
          </div>
          
          {/* Connect button */}
          <button 
            onClick={handleConnectSpotify} 
            disabled={isConnecting}
            className="btn-primary"
          >
            {isConnecting ? 'Connecting...' : 'Connect with Spotify'}
          </button>
          
          {/* Skip option */}
          <div className="text-center mt-4">
            <button 
              onClick={handleSkip}
              className="text-white/70 text-sm font-medium"
            >
              Skip for now
            </button>
            <p className="text-xs text-white/50 mt-1">
              You can always connect later
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default ConnectSpotify;