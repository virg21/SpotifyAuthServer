import React, { useState } from 'react';
import { useLocation } from 'wouter';
import MobileLayout from '@/components/MobileLayout';
import { PhoneIcon, MapPin } from 'lucide-react';

const WelcomePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [locationShared, setLocationShared] = useState(false);
  
  // Get current time for the status bar
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const handleVerifyPhone = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // In a real app, this would call an API to send a verification code
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to the Spotify connect page
      setLocation('/connect-spotify');
    }, 1500);
  };
  
  const handleShareLocation = () => {
    setLocationShared(true);
    
    // In a real app, this would request geolocation permission
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        console.log('Location shared:', position.coords);
        // Here you would store the coordinates in state or context
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationShared(false);
      }
    );
  };
  
  return (
    <MobileLayout 
      showNav={false} 
      back={false} 
      title="Quincy" 
      showStatusBar={true}
      time={getCurrentTime()}
    >
      <div className="flex flex-col items-center justify-start pt-6 pb-12">
        {/* Logo or app icon */}
        <div className="w-24 h-24 bg-gradient-primary rounded-xl mb-8 flex items-center justify-center">
          <span className="text-white text-3xl">🎵</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-center">Welcome to Quincy</h1>
        <p className="text-neutral-600 text-center mb-8">
          Discover local music events based on your taste
        </p>
        
        {/* Phone verification form */}
        <div className="w-full mb-8">
          <form onSubmit={handleVerifyPhone}>
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
                Enter your phone number to continue
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  className="input-field pl-10"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                We'll send a verification code to this number
              </p>
            </div>
            
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading || !phoneNumber}
            >
              {isLoading ? 'Sending code...' : 'Get Verification Code'}
            </button>
          </form>
        </div>
        
        {/* Location sharing option */}
        <div className="w-full">
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <div className="flex items-start mb-3">
              <MapPin className="h-5 w-5 text-neutral-700 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-neutral-800">Share your location</h3>
                <p className="text-sm text-neutral-600">
                  Find music events near you and get location-specific recommendations
                </p>
              </div>
            </div>
            
            <button
              onClick={handleShareLocation}
              className="btn-secondary py-2 mt-2 mb-0"
              disabled={locationShared}
            >
              {locationShared ? '✓ Location shared' : 'Share My Location'}
            </button>
          </div>
        </div>
        
        {/* Terms and privacy note */}
        <p className="text-xs text-neutral-500 mt-8 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </MobileLayout>
  );
};

export default WelcomePage;