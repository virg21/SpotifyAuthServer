import React, { useState } from 'react';
import { useLocation } from 'wouter';
import MobileLayout from '@/components/MobileLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

// Form schema validation
const phoneSchema = z.object({
  phoneNumber: z.string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .regex(/^\d+$/, { message: "Phone number can only contain digits" }),
  verificationCode: z.string().optional()
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

const WelcomePage = () => {
  const [, setLocation] = useLocation();
  const [verificationSent, setVerificationSent] = useState(false);
  const { toast } = useToast();
  
  // Get current time for the status bar
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const { register, handleSubmit, formState: { errors } } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: '',
      verificationCode: ''
    }
  });

  const onSendCode = async (data: PhoneFormValues) => {
    try {
      // In a real app, we would send this to the server
      // const response = await fetch('/api/verify/phone', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phoneNumber: data.phoneNumber })
      // });
      
      // if (!response.ok) throw new Error('Failed to send verification code');
      
      // For demo purposes, we'll just set the state
      setVerificationSent(true);
      toast({
        title: "Verification code sent!",
        description: `We've sent a verification code to ${data.phoneNumber}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive"
      });
    }
  };

  const onVerifyCode = async (data: PhoneFormValues) => {
    try {
      // In a real app, we would verify the code with the server
      // const response = await fetch('/api/verify/code', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     phoneNumber: data.phoneNumber,
      //     code: data.verificationCode
      //   })
      // });
      
      // if (!response.ok) throw new Error('Invalid verification code');
      
      // For demo purposes, we'll just redirect to the next page
      toast({
        title: "Success!",
        description: "Phone number verified successfully.",
      });
      
      // Redirect to Spotify connect page
      setTimeout(() => {
        setLocation('/connect-spotify');
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, we would send the coordinates to the server
          // const { latitude, longitude } = position.coords;
          // fetch('/api/user/location', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ latitude, longitude })
          // });
          
          toast({
            title: "Location shared",
            description: "Your location has been shared successfully.",
          });
        },
        (error) => {
          toast({
            title: "Error",
            description: "Failed to get your location. Please try again.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive"
      });
    }
  };

  return (
    <MobileLayout 
      showNav={true} 
      back={false} 
      title="ShiipMusic" 
      showStatusBar={true}
      time={getCurrentTime()}
      activeTab="home"
    >
      <div className="flex flex-col items-center justify-start h-full">
        <div className="w-full mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="music-note">♪</span> Navigate Your City Through Music
          </h1>
          <p className="text-neutral-700 text-lg mb-8">
            We use your music to find local experiences you'll love.
          </p>
          
          <form onSubmit={handleSubmit(verificationSent ? onVerifyCode : onSendCode)} className="space-y-4">
            <div>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                className={`input-field ${errors.phoneNumber ? 'border-red-500' : ''}`}
                {...register('phoneNumber')}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
              )}
            </div>
            
            {verificationSent && (
              <div>
                <Input
                  type="text"
                  placeholder="Enter verification code"
                  className={`input-field ${errors.verificationCode ? 'border-red-500' : ''}`}
                  {...register('verificationCode')}
                />
                {errors.verificationCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.verificationCode.message}</p>
                )}
              </div>
            )}
            
            <Button type="submit" className="w-full py-4 bg-neutral-800 hover:bg-neutral-700">
              {verificationSent ? 'Verify Code' : 'Send Code'}
            </Button>
          </form>
          
          <Button 
            type="button" 
            variant="outline"
            className="w-full py-4 mt-4 border-neutral-300"
            onClick={handleShareLocation}
          >
            Share My Location
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default WelcomePage;