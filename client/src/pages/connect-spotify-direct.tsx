import { useState } from 'react';
import { Loader2, ExternalLink } from "lucide-react";

export default function ConnectSpotifyDirectPage() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Connect directly to the Spotify login API route
  const spotifyAuthUrl = '/api/auth/spotify/login';
  
  const handleConnectSpotify = () => {
    setIsRedirecting(true);
    console.log('Redirecting to Spotify auth server at:', spotifyAuthUrl);
    window.location.href = spotifyAuthUrl;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md w-full p-8 space-y-6 text-center bg-card rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-primary">Connect with Spotify</h1>
        
        <p className="text-muted-foreground">
          Connect your Spotify account to get personalized event recommendations based on your music taste.
        </p>
        
        {isRedirecting ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p>Redirecting to Spotify authentication...</p>
          </div>
        ) : (
          <button
            onClick={handleConnectSpotify}
            className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2"
          >
            <ExternalLink size={18} />
            Connect Spotify Account
          </button>
        )}
        
        <p className="text-xs text-muted-foreground mt-6">
          You'll be redirected to Spotify to authorize the connection. 
          After authorization, you'll be returned to this application.
        </p>
        
        <div className="text-xs text-muted-foreground border-t border-border pt-4 mt-4">
          <p className="font-semibold mb-1">Direct URL for testing:</p>
          <a 
            href={spotifyAuthUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline break-all"
          >
            {spotifyAuthUrl}
          </a>
        </div>
      </div>
    </div>
  );
}