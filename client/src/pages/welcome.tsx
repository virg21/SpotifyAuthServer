import React, { useState } from 'react';
import { useLocation } from 'wouter';
import MobileLayout from '@/components/MobileLayout';
import { PhoneIcon, MapPin, Check } from 'lucide-react';

const WelcomePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [locationShared, setLocationShared] = useState(false);
  
  // Get current time for the status bar
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // In a real app, this would call an API to verify the code
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
        {/* Quincy Logo */}
        <h1 className="text-[var(--app-primary)] text-7xl font-bold mb-4 text-center">Quincy</h1>
        
        <p className="text-[var(--app-primary)] text-xl text-center mb-12">
          From playlists to places —<br/>
          your streaming data<br/>
          becomes your city map.
        </p>
        
        {/* Phone verification form */}
        <div className="w-full mb-6">
          <form onSubmit={handleSignIn}>
            <div className="mb-4">
              <input
                type="tel"
                id="phone"
                placeholder="Phone number"
                className="input-field"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <input
                type="text"
                id="verification"
                placeholder="Verification code"
                className="input-field"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading || !phoneNumber}
            >
              Sign In
            </button>
          </form>
        </div>
        
        {/* Location sharing option */}
        <div className="w-full mt-4 flex items-center">
          <div 
            onClick={handleShareLocation}
            className={`w-6 h-6 rounded-md flex items-center justify-center mr-3 cursor-pointer ${locationShared ? 'bg-[var(--app-primary)]' : 'border border-[var(--app-primary)]'}`}
          >
            {locationShared && <Check size={16} className="text-white" />}
          </div>
          <p className="text-[var(--app-primary)]">
            Share My Location
          </p>
        </div>
        
        {/* Terms and privacy note */}
        <p className="text-xs text-white/70 mt-8 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </MobileLayout>
  );
};

export default WelcomePage;