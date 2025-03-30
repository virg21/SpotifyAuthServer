import React, { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const AuthSuccessPage = () => {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/auth-success');
  const [userId, setUserId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  // Get userId from URL query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    setUserId(userId);
  }, []);

  // If userId is available, get music summary
  const { isLoading, isError, error } = useQuery({
    queryKey: ['/api/music/summary'],
    enabled: !!userId,
    retry: 1
  });

  // Countdown to redirect to dashboard
  useEffect(() => {
    if (!isLoading && !isError) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setLocation('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isLoading, isError, setLocation]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-neutral-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {isLoading ? (
          <>
            <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-green-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Analyzing your music...</h1>
            <p className="text-neutral-600">
              We're analyzing your Spotify data to provide personalized event recommendations.
              This may take a moment.
            </p>
          </>
        ) : isError ? (
          <>
            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <svg 
                className="h-12 w-12 text-red-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-neutral-600 mb-6">
              {(error as Error)?.message || "We couldn't analyze your music preferences."}
            </p>
            <button 
              onClick={() => setLocation('/connect-spotify')}
              className="btn-primary"
            >
              Try Again
            </button>
          </>
        ) : (
          <>
            <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-green-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg 
                className="h-12 w-12 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4">Success!</h1>
            <p className="text-neutral-600 mb-6">
              Your Spotify account has been connected. We've analyzed your music preferences
              and found some events you might like!
            </p>
            <p className="text-neutral-400 text-sm">
              Redirecting you to the dashboard in {countdown} seconds...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthSuccessPage;