import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import MobileLayout from '@/components/MobileLayout';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle, MapPin } from 'lucide-react';

// Map component with Quincy "Q" loader animation and actual map UI
const MapPlaceholder: React.FC<{ userName?: string; isComplete?: boolean }> = ({ 
  userName = "Brandon Campbell", 
  isComplete = false 
}) => {
  return (
    <div className="relative w-full aspect-square bg-neutral-200 rounded-lg mb-4 overflow-hidden">
      {/* Map background - a more detailed map design for completed state */}
      {isComplete ? (
        <>
          {/* Actual map image with neighborhood grid */}
          <div className="absolute inset-0 bg-[#E8E8E0]">
            {/* Street grid pattern */}
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-12">
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className="border border-neutral-300/40"></div>
              ))}
            </div>
            
            {/* Neighborhood area highlight */}
            <div className="absolute top-1/4 left-1/3 w-1/2 h-1/2 bg-[var(--app-primary)]/20 rounded-full blur-lg"></div>
            
            {/* Main roads */}
            <div className="absolute top-1/2 left-0 w-full h-[6px] bg-neutral-300"></div>
            <div className="absolute top-0 left-1/3 w-[6px] h-full bg-neutral-300"></div>
            <div className="absolute top-[40%] left-0 w-full h-[4px] bg-neutral-300/70"></div>
            <div className="absolute top-0 left-[60%] w-[4px] h-full bg-neutral-300/70"></div>
            
            {/* Venue pin */}
            <div className="absolute top-[38%] left-[42%] animate-bounce-slow">
              <div className="w-6 h-6 bg-[var(--app-primary)] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                🎵
              </div>
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[var(--app-primary)] mx-auto -mt-1"></div>
            </div>
          </div>
          
          {/* Location label */}
          <div className="absolute top-4 left-4 bg-[var(--app-primary)]/90 text-white px-3 py-1 rounded-md text-sm shadow-md">
            Wicker Park
          </div>
          
          {/* Venue label */}
          <div className="absolute bottom-12 left-[35%] bg-black/80 text-white px-3 py-2 rounded-full text-sm shadow-lg flex items-center">
            <span className="mr-1">🎸</span> The Empty Bottle
          </div>
        </>
      ) : (
        <>
          {/* Simple map grid lines for loading state */}
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-neutral-300/30"></div>
            ))}
          </div>
          
          {/* Quincy "Q" loader animation */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="q-loader">
              <div className="q-loader-circle"></div>
              <div className="q-loader-inner">Q</div>
            </div>
          </div>
        </>
      )}
      
      {/* User label */}
      <div className="absolute bottom-4 left-4 bg-blue-600/80 text-white px-3 py-1 rounded-md text-sm shadow-md">
        {userName}
      </div>
    </div>
  );
};

// Array of music facts to display (reduced to 4 as requested)
const musicFacts = [
  "You vibe with more jazz than 86% of listeners.",
  "Your top genre has roots in Chicago's South Side music scene.",
  "Three of your top artists have performed at Chicago's Lollapalooza festival.",
  "Your playlist diversity is higher than 91% of users in your city."
];

// Analysis steps to display
const analysisSteps = [
  { id: 1, text: "Analyzing your genres & artists", complete: false },
  { id: 2, text: "Locating your music zones", complete: false },
  { id: 3, text: "Mapping real-world matches", complete: false },
  { id: 4, text: "Personalizing your music-powered city guide", complete: false }
];

const AnalyzingMusicPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [displayedFacts, setDisplayedFacts] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Get current time for the status bar
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Simulate loading steps
  useEffect(() => {
    if (currentStep <= analysisSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else if (currentStep > analysisSteps.length && !isComplete) {
      setIsComplete(true);
      
      // No longer auto-redirecting, user will click the button instead
    }
  }, [currentStep, isComplete]);

  // States for controlling when to show various elements
  const [showLocationInsight, setShowLocationInsight] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [showFacts, setShowFacts] = useState(false);
  
  // First show the map and analysis steps
  useEffect(() => {
    if (currentStep > 2 && !showFacts) {
      // After step 2 completes, show the fun facts section
      const factsTimer = setTimeout(() => {
        setShowFacts(true);
      }, 1000);
      
      return () => clearTimeout(factsTimer);
    }
  }, [currentStep, showFacts]);

  // Add facts in sequence, one at a time
  useEffect(() => {
    if (showFacts && displayedFacts.length < musicFacts.length) {
      const timer = setTimeout(() => {
        setDisplayedFacts(prev => {
          // Add the next fact in sequence
          return [...prev, musicFacts[prev.length]];
        });
      }, 2500); // Slightly faster to show facts
      
      return () => clearTimeout(timer);
    } else if (displayedFacts.length >= musicFacts.length && !showLocationInsight && currentStep > analysisSteps.length) {
      // Once all facts are displayed, show location insight after a delay
      const insightTimer = setTimeout(() => {
        setShowLocationInsight(true);
      }, 1500);
      
      return () => clearTimeout(insightTimer);
    }
  }, [displayedFacts, currentStep, showLocationInsight, showFacts, musicFacts.length, analysisSteps.length]);

  // Function to handle navigation to events page
  const handleSeeEvents = () => {
    setLocation('/events');
  };

  return (
    <MobileLayout 
      showNav={true} 
      back={false} 
      title="Quincy" 
      showStatusBar={true}
      time={getCurrentTime()}
      activeTab="home"
    >
      <div className="flex flex-col items-center justify-start h-full pb-20">
        {/* Map visualization - shows detailed map after all steps complete */}
        <MapPlaceholder isComplete={showLocationInsight} />
        
        {/* Title */}
        <h1 className="text-2xl font-bold mb-4 text-center">WE'RE TUNING YOUR VIBE 🎧</h1>
        
        {/* Progress steps */}
        <div className="w-full mb-6">
          {analysisSteps.map((step, index) => {
            const isComplete = currentStep > step.id;
            const isActive = currentStep === step.id;
            
            return (
              <div 
                key={step.id} 
                className={`flex items-center justify-between py-3 border-b border-gray-200 ${isActive ? 'animate-pulse' : ''}`}
              >
                <div className="flex items-center">
                  {isComplete ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  ) : (
                    <Loader2 className={`h-5 w-5 mr-3 ${isActive ? 'animate-spin text-blue-500' : 'text-gray-300'}`} />
                  )}
                  <span className={`${isComplete ? 'text-gray-700' : isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step.text}
                  </span>
                </div>
                <span className="text-gray-400">
                  {isComplete ? '✓' : isActive ? '...' : '...'}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Fun facts section */}
        {showFacts && displayedFacts.length > 0 && (
          <div className="w-full mb-6">
            <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">FUN FACTS</h2>
            
            {displayedFacts.map((fact, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between py-3 border-b border-gray-200 animate-fade-in"
              >
                <div className="flex items-center">
                  {/* Q-themed bullet point */}
                  <div className="h-5 w-5 rounded-full bg-gradient-primary flex items-center justify-center text-white mr-3 text-xs font-bold">
                    Q
                  </div>
                  <span className="text-gray-700">{fact}</span>
                </div>
                {/* Small indicator animation */}
                <div className="h-2 w-2 rounded-full bg-[var(--app-primary)] animate-pulse"></div>
              </div>
            ))}
          </div>
        )}
        
        {/* Location-based fact only shows after all fun facts are displayed */}
        {showLocationInsight && (
          <div className="w-full mt-4 mb-4 bg-gradient-to-r from-[var(--app-primary)] to-[var(--primary-dark)] p-4 rounded-lg border border-[var(--app-primary)] animate-fade-in">
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center text-[var(--app-primary)] mr-3 text-base font-bold">
                Q
              </div>
              <div>
                <p className="font-medium text-white text-lg">Location match found!</p>
                <p className="text-white/90 mb-4">
                  Based on your music taste, there are a lot of shows and experiences near Wicker Park that match your vibe - 
                  3 of your top artists have performed at legendary venue The Empty Bottle
                </p>
                
                {/* Button to navigate to events page */}
                <button 
                  onClick={handleSeeEvents}
                  className="w-full py-3 bg-white text-[var(--app-primary)] font-semibold rounded-lg shadow-md hover:bg-white/90 transition-colors"
                >
                  Discover Hidden Shows Just For You
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default AnalyzingMusicPage;