import { useEffect } from 'react';
import { Loader2 } from "lucide-react";

export default function ConnectSpotifyDirectPage() {
  useEffect(() => {
    // Redirect to the Spotify auth server
    window.location.href = 'http://localhost:3000';
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