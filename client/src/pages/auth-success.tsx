import React, { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Music, TrendingUp, BarChart3, Headphones } from 'lucide-react';
import MobileLayout from '@/components/MobileLayout';

const AuthSuccessPage = () => {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/auth-success');
  const [userId, setUserId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [analysisStep, setAnalysisStep] = useState(1);

  // Get current time for the status bar
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Get userId from URL query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    setUserId(userId);
  }, []);

  // Simulate analysis steps for visual feedback
  useEffect(() => {
    if (analysisStep < 4 && userId) {
      const timer = setTimeout(() => {
        setAnalysisStep(step => step + 1);
      }, 1200);
      
      return () => clearTimeout(timer);
    }
  }, [analysisStep, userId]);

  // If userId is available, get music summary
  const { isLoading, isError, error } = useQuery({
    queryKey: ['/api/music/summary'],
    enabled: !!userId,
    retry: 1
  });

  // Countdown to redirect to dashboard
  useEffect(() => {
    if (analysisStep >= 4 && !isError) {
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
  }, [analysisStep, isError, setLocation]);

  // Progress bar calculation
  const getProgressWidth = () => {
    if (isError) return 0;
    if (analysisStep === 4) return 100;
    return analysisStep * 25;
  };

  return (
    <MobileLayout 
      showNav={false} 
      back={false} 
      title="Quincy" 
      showStatusBar={true}
      time={getCurrentTime()}
    >
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        {isLoading || analysisStep < 4 ? (
          <>
            <div className="bg-gradient-to-br from-pink-400 via-purple-500 to-green-400 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
              {analysisStep === 1 && <Music className="h-16 w-16 text-white animate-pulse" />}
              {analysisStep === 2 && <TrendingUp className="h-16 w-16 text-white animate-pulse" />}
              {analysisStep === 3 && <BarChart3 className="h-16 w-16 text-white animate-pulse" />}
              {analysisStep >= 4 && <Headphones className="h-16 w-16 text-white animate-pulse" />}
            </div>
            
            <h1 className="text-2xl font-bold mb-4 text-center">
              {analysisStep === 1 && "Finding your top artists..."}
              {analysisStep === 2 && "Analyzing your genres..."}
              {analysisStep === 3 && "Discovering your music personality..."}
              {analysisStep >= 4 && "Finding events you'll love..."}
            </h1>
            
            <div className="w-full max-w-xs mb-8">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-green-500"
                  style={{ width: `${getProgressWidth()}%`, transition: 'width 0.5s ease-in-out' }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2 text-right">{getProgressWidth()}%</p>
            </div>
            
            <p className="text-neutral-600 text-center max-w-xs">
              We're analyzing your Spotify data to provide personalized event recommendations.
              This will only take a moment.
            </p>
          </>
        ) : isError ? (
          <>
            <div className="w-32 h-32 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-8">
              <svg 
                className="h-16 w-16 text-red-500" 
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
            <h1 className="text-2xl font-bold mb-4 text-center">Something went wrong</h1>
            <p className="text-neutral-600 mb-8 text-center max-w-xs">
              {(error as Error)?.message || "We couldn't analyze your music preferences."}
            </p>
            <button 
              onClick={() => setLocation('/connect-spotify')}
              className="btn-primary max-w-xs"
            >
              Try Again
            </button>
          </>
        ) : (
          <>
            <div className="bg-gradient-to-br from-pink-400 via-purple-500 to-green-400 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg 
                className="h-16 w-16 text-white" 
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
            <h1 className="text-3xl font-bold mb-4 text-center">Success!</h1>
            <p className="text-neutral-600 mb-8 text-center max-w-xs">
              Your Spotify account has been connected. We've analyzed your music preferences
              and found some events you might like!
            </p>
            
            <div className="w-full max-w-xs">
              <div className="mb-3 bg-gray-100 rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-1">Your Top Genres</h3>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 text-xs bg-pink-100 text-pink-800 rounded-full">Electronic</span>
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">House</span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Hip-Hop</span>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Indie</span>
                </div>
              </div>
              
              <div className="flex justify-center mb-4">
                <button 
                  onClick={() => setLocation('/events')}
                  className="btn-primary"
                >
                  View Recommended Events
                </button>
              </div>
              
              <p className="text-neutral-400 text-sm text-center">
                Redirecting to dashboard in {countdown} seconds...
              </p>
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  );
};

export default AuthSuccessPage;