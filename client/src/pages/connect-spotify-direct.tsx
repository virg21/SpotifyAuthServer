import { useEffect } from 'react';
import { Loader2 } from "lucide-react";

export default function ConnectSpotifyDirectPage() {
  useEffect(() => {
    // Redirect to the Spotify auth server
    // In Replit, we need to use the same domain but port 3000
    // Unfortunately, Replit doesn't support multiple ports on the same domain
    // for external access, so we'll just use localhost:3000 for testing
    const spotifyAuthUrl = 'http://localhost:3000';
    
    console.log('Redirecting to Spotify auth server at:', spotifyAuthUrl);
    
    // For demonstration purposes only - in a real implementation,
    // we'd handle this differently with a proper API route
    window.location.href = spotifyAuthUrl;
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 space-y-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <h1 className="text-2xl font-bold">Redirecting to Spotify</h1>
        <p className="text-muted-foreground">
          You'll be redirected to our Spotify authentication page in a moment...
        </p>
      </div>
    </div>
  );
}