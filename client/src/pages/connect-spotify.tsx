import { useEffect, useState } from 'react';
import MobileLayout from '@/components/MobileLayout';
import { Button } from '@/components/ui/button';
import { Loader2, Music, Headphones, Check, Music2 } from 'lucide-react';
import axios from 'axios';

const ConnectSpotify = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  
  // Get current time for the status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Fetch Spotify login URL when component mounts
  useEffect(() => {
    const fetchSpotifyLoginUrl = async () => {
      try {
        // For development, we'll just use a hardcoded URL since we're handling the redirect on the backend
        setSpotifyUrl('/api/auth/spotify/login');
      } catch (error) {
        console.error('Error fetching Spotify login URL:', error);
      }
    };
    
    fetchSpotifyLoginUrl();
  }, []);
  
  const handleConnectSpotify = () => {
    setIsLoading(true);
    // Redirect to Spotify authorization page
    window.location.href = spotifyUrl;
  };
  
  return (
    <MobileLayout 
      showNav={false} 
      back={false}
      title="Quincy" 
      showStatusBar={true}
      time={currentTime}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10">
          <div className="w-20 h-20 bg-[var(--app-primary)] rounded-full flex items-center justify-center mb-6">
            <Music2 className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-white">Connect Your Spotify</h1>
          
          <p className="text-white/80 mb-8">
            We'll use your Spotify listening history to recommend events and shows you'll love.
          </p>
          
          <div className="w-full space-y-5 mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[var(--app-primary)] flex items-center justify-center mr-4">
                <Music className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">Personalized Events</h3>
                <p className="text-white/70 text-sm">Find local shows from artists you'll love</p>
              </div>
              <Check className="w-5 h-5 text-[var(--app-primary)]" />
            </div>
            
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[var(--app-primary)] flex items-center justify-center mr-4">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">Discover Similar Artists</h3>
                <p className="text-white/70 text-sm">Expand your music taste with local shows</p>
              </div>
              <Check className="w-5 h-5 text-[var(--app-primary)]" />
            </div>
          </div>
          
          <div className="w-full">
            <Button 
              onClick={handleConnectSpotify}
              disabled={isLoading || !spotifyUrl}
              className="w-full bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] py-6 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Spotify'
              )}
            </Button>
          </div>
          
          <p className="text-white/60 text-xs mt-4">
            We only access your listening data. We never post or change anything in your account.
          </p>
        </div>
      </div>
    </MobileLayout>
  );
};

export default ConnectSpotify;