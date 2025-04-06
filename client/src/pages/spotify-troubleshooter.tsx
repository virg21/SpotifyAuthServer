import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, LogIn, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { apiRequest } from "@/lib/queryClient";
import { LoadingSpinner } from '@/components/loading-spinner';

export default function SpotifyTroubleshooter() {
  const [checking, setChecking] = useState(false);
  const [spotifyLoginUrl, setSpotifyLoginUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string[]>([]);
  const [isFixing, setIsFixing] = useState(false);

  const testSpotifyConnectivity = async () => {
    setChecking(true);
    setErrors([]);
    setSuccess([]);
    
    try {
      // Get the Spotify login URL
      const loginResponse = await apiRequest('GET', '/api/auth/spotify/login-url');
      const data = await loginResponse.json();
      setSpotifyLoginUrl(data.url);
      setSuccess(prev => [...prev, "Successfully generated Spotify authorization URL"]);
      
      // Try to connect to Spotify accounts API
      try {
        const connectivityResponse = await apiRequest('GET', '/api/auth/test-spotify-connectivity');
        const connectivityData = await connectivityResponse.json();
        
        if (connectivityData.canReachSpotify) {
          setSuccess(prev => [...prev, "Successfully connected to Spotify accounts API"]);
        } else {
          setErrors(prev => [...prev, `Failed to connect to Spotify accounts API: ${connectivityData.error}`]);
        }
      } catch (error: any) {
        setErrors(prev => [...prev, `Error testing Spotify connectivity: ${error.message}`]);
      }
    } catch (error: any) {
      setErrors(prev => [...prev, `Failed to get Spotify login URL: ${error.message}`]);
    } finally {
      setChecking(false);
    }
  };

  const redirectToSpotify = () => {
    if (spotifyLoginUrl) {
      window.location.href = spotifyLoginUrl;
    }
  };

  return (
    <div className="container max-w-3xl mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white">
          <CardTitle className="text-2xl">Spotify Troubleshooter</CardTitle>
          <CardDescription className="text-emerald-100">
            Diagnose and fix Spotify connectivity issues
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 pb-2 space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Step 1: Test Spotify Connectivity</h3>
              <p className="text-muted-foreground mb-4">
                This will check if our app can connect to the Spotify API servers.
              </p>
              
              <Button 
                onClick={testSpotifyConnectivity} 
                disabled={checking}
                variant="default"
                className="w-full sm:w-auto"
              >
                {checking ? <LoadingSpinner /> : 'Test Spotify Connectivity'}
              </Button>
            </div>
            
            {success.length > 0 && (
              <div className="space-y-2">
                {success.map((message, i) => (
                  <Alert key={i} className="bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Success</AlertTitle>
                    <AlertDescription className="text-green-700">
                      {message}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
            
            {errors.length > 0 && (
              <div className="space-y-2">
                {errors.map((error, i) => (
                  <Alert key={i} variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
            
            {spotifyLoginUrl && (
              <div className="mt-6">
                <Separator className="my-4" />
                <h3 className="text-lg font-semibold mb-2">Step 2: Try Logging in with Spotify</h3>
                <p className="text-muted-foreground mb-4">
                  If the connectivity test passed, you can try logging in with Spotify directly.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={redirectToSpotify}
                    className="bg-[#1DB954] hover:bg-[#1ed760] text-white"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Log in with Spotify
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.open('https://developer.spotify.com/dashboard', '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Spotify Developer Dashboard
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 bg-slate-50 p-4 rounded-md border border-slate-200">
            <h3 className="text-lg font-semibold mb-2">Spotify Developer Settings</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Make sure your Spotify Developer Dashboard is configured with exactly this redirect URI:
            </p>
            <code className="block p-3 bg-slate-100 border border-slate-300 rounded text-sm overflow-x-auto">
              https://workspace.vliste415.repl.co/api/auth/spotify/callback
            </code>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col items-start pt-0">
          <p className="text-sm text-muted-foreground italic">
            Note: Spotify integration requires proper configuration in both the app and the Spotify Developer Dashboard.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}