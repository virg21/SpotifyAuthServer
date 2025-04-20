import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SpotifyAuthSuccess() {
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<{success: boolean, userId?: number, timestamp?: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('Checking Spotify auth status...');
        // Wait a bit to ensure session is saved
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const response = await axios.get('/api/auth/spotify/status');
        console.log('Auth status response:', response.data);
        
        setAuthStatus(response.data);
        
        if (response.data.success) {
          // Auth successful, redirect after showing success message
          toast({
            title: 'Spotify connected successfully!',
            description: 'Your Spotify account has been connected.',
            variant: 'default',
          });
          
          // Redirect to analyzing music page after 2 seconds
          setTimeout(() => {
            setLocation('/analyzing-music');
          }, 2000);
        } else {
          // Auth failed
          setError('Could not verify Spotify authentication. Please try again.');
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        setError('An error occurred while checking authentication status.');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [setLocation, toast]);

  const handleRetry = () => {
    setLocation('/connect-spotify');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <div className="flex flex-col items-center space-y-4 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold">Completing Spotify Authentication</h1>
          <p className="text-muted-foreground">Verifying your Spotify connection...</p>
          <Loader2 className="h-8 w-8 animate-spin text-primary mt-4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <div className="flex flex-col items-center space-y-4 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-destructive">Authentication Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={handleRetry} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="flex flex-col items-center space-y-4 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-primary">Spotify Connected!</h1>
        <p className="text-muted-foreground">
          Your Spotify account has been successfully connected.
          Redirecting to analyze your music...
        </p>
        <Loader2 className="h-8 w-8 animate-spin text-primary mt-4" />
      </div>
    </div>
  );
}