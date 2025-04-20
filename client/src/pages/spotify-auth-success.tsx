import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MobileLayout from '@/components/MobileLayout';

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

  if (loading) {
    return (
      <MobileLayout 
        showNav={false} 
        back={false} 
        title="Quincy" 
        showStatusBar={true}
        time={currentTime}
      >
        <div className="flex flex-col items-center justify-center h-full px-8 py-12">
          <h1 className="text-2xl font-bold mb-4 text-white">Completing Authentication</h1>
          <p className="text-white/80 text-center mb-8">
            Verifying your Spotify connection...
          </p>
          <Loader2 className="h-12 w-12 animate-spin text-white mt-4" />
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout 
        showNav={false} 
        back={false} 
        title="Quincy" 
        showStatusBar={true}
        time={currentTime}
      >
        <div className="flex flex-col items-center justify-center h-full px-8 py-12">
          <h1 className="text-2xl font-bold mb-4 text-[#F73E7C]">Authentication Error</h1>
          <p className="text-white/80 text-center mb-8">{error}</p>
          <Button onClick={handleRetry} className="mt-4 bg-[#F73E7C] hover:bg-[#F73E7C]/80">
            Try Again
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout 
      showNav={false} 
      back={false} 
      title="Quincy" 
      showStatusBar={true}
      time={currentTime}
    >
      <div className="flex flex-col items-center justify-center h-full px-8 py-12">
        <h1 className="text-2xl font-bold mb-4 text-white">Spotify Connected!</h1>
        <p className="text-white/80 text-center mb-8">
          Your Spotify account has been successfully connected.
          Redirecting to analyze your music...
        </p>
        <Loader2 className="h-12 w-12 animate-spin text-white mt-4" />
      </div>
    </MobileLayout>
  );
}