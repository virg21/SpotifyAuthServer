import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import MobileLayout from '@/components/MobileLayout';
import { Progress } from '@/components/ui/progress';
import { Music2, Disc, Radio, Headphones, Library } from 'lucide-react';
import axios from 'axios';

const AnalyzingMusicPage = () => {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  
  const steps = [
    { text: 'Analyzing top genres...', icon: Music2 },
    { text: 'Processing favorite artists...', icon: Disc },
    { text: 'Examining listening habits...', icon: Radio },
    { text: 'Identifying music preferences...', icon: Headphones },
    { text: 'Creating personalized profile...', icon: Library },
  ];
  
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
  
  // Simulate the analysis process
  useEffect(() => {
    const totalDuration = 7000; // 7 seconds total
    const totalSteps = steps.length;
    const stepDuration = totalDuration / totalSteps;
    
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + (100 / (totalDuration / 100));
        
        // Update the current step based on progress
        const stepProgress = Math.floor((newProgress / 100) * totalSteps);
        setCurrentStep(Math.min(stepProgress, totalSteps - 1));
        
        if (newProgress >= 100) {
          clearInterval(interval);
          // Redirect to events page after a short delay
          setTimeout(() => {
            setLocation('/events');
          }, 500);
          return 100;
        }
        
        return newProgress;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [setLocation, steps.length]);
  
  // Get the current step content
  const CurrentStepIcon = steps[currentStep].icon;
  
  return (
    <MobileLayout 
      showNav={false} 
      back={false} 
      title="Quincy" 
      showStatusBar={true}
      time={currentTime}
    >
      <div className="flex flex-col items-center justify-center h-full px-8 py-12">
        <div className="w-24 h-24 bg-[var(--app-primary)] rounded-full flex items-center justify-center mb-10">
          <CurrentStepIcon className="w-12 h-12 text-white animate-pulse" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-white">
          Analyzing Your Music
        </h1>
        
        <p className="text-white/80 text-center mb-8">
          We're processing your Spotify data to find events that match your music taste.
        </p>
        
        <div className="w-full mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <p className="text-white/70 text-center">
            {steps[currentStep].text}
          </p>
        </div>
        
        <div className="max-w-md text-center">
          <p className="text-white/60 text-sm">
            We're analyzing your favorite genres, artists, and listening habits to find local concerts and events you'll love.
          </p>
        </div>
      </div>
    </MobileLayout>
  );
};

export default AnalyzingMusicPage;