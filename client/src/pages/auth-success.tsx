import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

const AuthSuccessPage = () => {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const processSpotifyCallback = async () => {
      try {
        // The server handles the Spotify callback - we just need to check
        // if authentication was successful and redirect the user
        const response = await axios.get('/api/auth/me');
        
        if (response.data && response.data.spotifyId) {
          // Successful authentication, redirect to the analyzing page
          setLocation('/analyzing-music');
        } else {
          // No Spotify ID yet, something went wrong
          setError('Authentication failed. Please try again.');
          setTimeout(() => setLocation('/connect-spotify'), 3000);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Authentication failed. Please try again.');
        setTimeout(() => setLocation('/connect-spotify'), 3000);
      }
    };
    
    processSpotifyCallback();
  }, [setLocation]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--app-bg)]">
      {error ? (
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-white mb-4">
            Authentication Error
          </h1>
          <p className="text-white/80 mb-4">{error}</p>
          <p className="text-white/60">Redirecting you back...</p>
        </div>
      ) : (
        <div className="text-center p-6">
          <Loader2 className="h-12 w-12 animate-spin text-[var(--app-primary)] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Connecting to Spotify
          </h1>
          <p className="text-white/80">
            Please wait while we complete your authentication...
          </p>
        </div>
      )}
    </div>
  );
};

export default AuthSuccessPage;