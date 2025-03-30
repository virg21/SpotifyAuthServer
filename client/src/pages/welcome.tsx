import React, { useState } from 'react';
import { useLocation } from 'wouter';
import MobileLayout from '@/components/MobileLayout';

const WelcomePage = () => {
  const [location, setLocation] = useLocation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call the API to send a verification code
    setIsVerifying(true);
  };
  
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would verify the code
    setLocation('/connect-spotify');
  };
  
  const handleShareLocation = () => {
    // In a real app, this would request location permissions
    setLocation('/connect-spotify');
  };
  
  return (
    <MobileLayout showNav={false} back={false}>
      <div className="flex flex-col items-start justify-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <span className="music-note">♪</span>
            Navigate Your City Through Music
          </h1>
          <p className="text-neutral-600">
            We use your music to find local experiences you'll love.
          </p>
        </div>
        
        {!isVerifying ? (
          <form onSubmit={handleSendCode} className="w-full">
            <input
              type="tel"
              placeholder="Enter your phone number"
              className="input-field"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary">
              Send Code
            </button>
            
            <button 
              type="button" 
              className="btn-secondary"
              onClick={handleShareLocation}
            >
              Share My Location
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="w-full">
            <input
              type="text"
              placeholder="Enter verification code"
              className="input-field"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary">
              Verify
            </button>
            
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => setIsVerifying(false)}
            >
              Back
            </button>
          </form>
        )}
      </div>
    </MobileLayout>
  );
};

export default WelcomePage;