import React, { useState } from 'react';
import { useLocation } from 'wouter';
import MobileLayout from '@/components/MobileLayout';
import { PhoneIcon, MapPin, Check, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WelcomePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [locationShared, setLocationShared] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [userId, setUserId] = useState(0);
  const { toast } = useToast();
  
  // Get current time for the status bar
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Validate phone number format
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number with country code (e.g., +12345678901)",
        variant: "destructive"
      });
      return;
    }
    
    // Ensure it has + prefix for E.164 format
    let formattedPhone = phoneNumber;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
      setPhoneNumber(formattedPhone);
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/verify/phone/0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone: formattedPhone })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code');
      }
      
      // Store the userId returned from the API for use in verification
      if (data.userId) {
        setUserId(data.userId);
        console.log('User ID set to:', data.userId);
      }
      
      toast({
        title: "Verification Code Sent",
        description: "Enter the code we sent to your phone to continue",
      });
      
      setCodeSent(true);
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send verification code",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      toast({
        title: "Missing Code",
        description: "Please enter the verification code from your SMS",
        variant: "destructive"
      });
      return;
    }
    
    if (!userId) {
      toast({
        title: "Error",
        description: "Missing user ID. Please try sending the code again.",
        variant: "destructive"
      });
      setCodeSent(false);
      return;
    }
    
    setVerifyLoading(true);
    
    try {
      const response = await fetch(`/api/verify/code/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: verificationCode })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify code');
      }
      
      if (data.verified) {
        toast({
          title: "Phone Verified",
          description: "Your phone number has been verified successfully"
        });
        
        // Navigate to the Spotify connect page
        setLocation('/connect-spotify');
      } else {
        toast({
          title: "Invalid Code",
          description: "The verification code is invalid or expired. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify code",
        variant: "destructive"
      });
    } finally {
      setVerifyLoading(false);
    }
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
        
        <p className="text-white text-xl text-center mb-8">
          From playlists to places —<br/>
          your streaming data<br/>
          becomes your city map.
        </p>

        <p className="text-white text-sm text-center mb-8 opacity-80">
          Get personalized event recommendations in your city<br/>
          based on your unique music taste.
        </p>
        
        {/* Phone verification form */}
        <div className="w-full mb-6">
          {!codeSent ? (
            <form onSubmit={handleSendCode}>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="tel"
                    id="phone"
                    placeholder="Phone number (with country code)"
                    className="input-field pl-10"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={16} />
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Format: +1XXXXXXXXXX (include country code)
                </p>
              </div>
              
              <button 
                type="submit" 
                className="btn-primary w-full flex items-center justify-center"
                disabled={isLoading || !phoneNumber}
              >
                {isLoading ? (
                  <Loader className="animate-spin mr-2" size={16} />
                ) : null}
                Send Verification Code
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    id="verification"
                    placeholder="Enter 6-digit code"
                    className="input-field"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-white/60">
                    Code sent to {phoneNumber}
                  </p>
                  <button 
                    type="button"
                    className="text-xs text-[var(--app-primary)] hover:underline"
                    onClick={() => handleSendCode()}
                    disabled={isLoading}
                  >
                    Resend Code
                  </button>
                </div>
                <p className="text-xs text-white/70 mt-1 border border-[var(--app-primary)] rounded p-1">
                  <span className="font-semibold">Dev Mode:</span> Use code "123456" for any phone number
                </p>
              </div>
              
              <button 
                type="submit" 
                className="btn-primary w-full flex items-center justify-center"
                disabled={verifyLoading || !verificationCode}
              >
                {verifyLoading ? (
                  <Loader className="animate-spin mr-2" size={16} />
                ) : null}
                Verify Code
              </button>
            </form>
          )}
        </div>
        
        {/* Location sharing option */}
        <div className="w-full mt-4 flex items-center">
          <div 
            onClick={handleShareLocation}
            className={`w-6 h-6 rounded-md flex items-center justify-center mr-3 cursor-pointer ${locationShared ? 'bg-[var(--app-primary)]' : 'border border-[var(--app-primary)]'}`}
          >
            {locationShared && <Check size={16} className="text-white" />}
          </div>
          <p className="text-white">
            Share My Location
          </p>
        </div>
        
        {/* Direct Spotify connection for testing */}
        <div className="w-full mt-8">
          <button 
            type="button" 
            className="btn-secondary w-full"
            onClick={() => setLocation('/connect-spotify-direct')}
          >
            Skip Phone Verification - Connect Spotify Directly
          </button>
          <p className="text-xs text-white/60 mt-1 text-center">
            This option bypasses phone verification for testing purposes
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