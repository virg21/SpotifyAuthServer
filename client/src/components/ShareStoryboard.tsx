import { useState, useEffect, useRef } from 'react';
import { Event } from '@shared/schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// Define the EventWithRelevance interface matching what's used in MobileEvents.tsx
interface EventWithRelevance extends Partial<Event> {
  id: number;
  name: string;
  venue: string;
  date: Date;
  relevanceScore?: number;
  personalReason?: string;
  genre?: string;
}

interface ShareStoryboardProps {
  event: EventWithRelevance | Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const ShareStoryboard = ({ event, isOpen, onClose }: ShareStoryboardProps) => {
  const [step, setStep] = useState(0);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Reset step when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setCopied(false);
      
      // Generate unique share URL for this event
      if (event) {
        const baseUrl = window.location.origin;
        setShareUrl(`${baseUrl}/event/${event.id}?ref=share`);
      }
    }
  }, [isOpen, event]);
  
  // Generate preview image when event changes or when we reach the preview step
  useEffect(() => {
    if (event && canvasRef.current && step === 2) {
      generatePreviewImage();
    }
  }, [event, step]);
  
  const generatePreviewImage = () => {
    if (!canvasRef.current || !event) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = 1200;
    canvas.height = 630;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#00442C');
    gradient.addColorStop(1, '#002E1D');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add Quincy logo/branding
    ctx.fillStyle = '#F73E7C';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('QUINCY', 60, 80);
    
    // Add event details
    ctx.fillStyle = 'white';
    ctx.font = 'bold 72px sans-serif';
    
    // Event name - handle long names
    const eventName = event.name || 'Music Event';
    const maxWidth = canvas.width - 120;
    let fontSize = 72;
    ctx.font = `bold ${fontSize}px sans-serif`;
    
    // Reduce font size until it fits
    while (ctx.measureText(eventName).width > maxWidth && fontSize > 40) {
      fontSize -= 4;
      ctx.font = `bold ${fontSize}px sans-serif`;
    }
    
    ctx.fillText(eventName, 60, 200);
    
    // Venue and date
    ctx.font = 'bold 48px sans-serif';
    const venueText = event.venue || 'Venue: TBA';
    ctx.fillText(venueText, 60, 280);
    
    const dateOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    const dateText = event.date ? new Date(event.date).toLocaleDateString('en-US', dateOptions) : 'Date: TBA';
    ctx.fillText(dateText, 60, 350);
    
    // Add decorative elements
    ctx.fillStyle = '#F73E7C';
    ctx.beginPath();
    ctx.arc(canvas.width - 100, 100, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a musical note icon (simplified)
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 200, canvas.height - 100);
    ctx.lineTo(canvas.width - 200, canvas.height - 200);
    ctx.lineTo(canvas.width - 150, canvas.height - 200);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(canvas.width - 200, canvas.height - 100, 20, 0, Math.PI * 2);
    ctx.stroke();
    
    // Add personalized message
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '32px sans-serif';
    ctx.fillText('Shared by Quincy - Your Personal Music Event Finder', 60, canvas.height - 60);
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };
  
  const shareToSocialMedia = (platform: 'twitter' | 'facebook' | 'instagram') => {
    if (!event) return;
    
    const text = `Check out ${event.name} at ${event.venue} on ${new Date(event.date || '').toLocaleDateString()}! Found via Quincy.`;
    let url;
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'instagram':
        // Instagram doesn't have a direct share URL, so we'll prompt to copy instead
        copyToClipboard();
        alert('Copy this link and share it on Instagram!');
        return;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
  };
  
  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };
  
  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };
  
  // Step content components
  const StepWelcome = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center py-6"
    >
      <div className="mb-6">
        <div className="mx-auto w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-600">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-4">Share this event with friends</h3>
      <p className="text-muted-foreground mb-8">Let your music-loving friends know about this awesome event!</p>
    </motion.div>
  );
  
  const StepCustomize = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="py-6"
    >
      <h3 className="text-lg font-semibold mb-4">Customize your share</h3>
      <div className="bg-muted p-4 rounded-md mb-4">
        <p className="font-medium text-sm">Preview of what your friends will see:</p>
        <div className="mt-2 p-3 bg-background rounded border">
          <p className="font-bold">{event?.name}</p>
          <p className="text-sm text-muted-foreground">
            {event?.venue} • {event?.date ? new Date(event.date).toLocaleDateString() : 'TBA'}
          </p>
          <p className="text-sm mt-2">Shared via Quincy</p>
        </div>
      </div>
    </motion.div>
  );
  
  const StepPreview = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="py-6"
    >
      <h3 className="text-lg font-semibold mb-4">Share Preview</h3>
      <div className="mb-4 relative">
        <canvas 
          ref={canvasRef} 
          className="w-full h-auto border border-border rounded-md"
          style={{ maxHeight: '200px' }}
        />
        <div className="absolute bottom-2 right-2">
          <span className="text-xs bg-black/70 text-white px-2 py-1 rounded">Preview</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        This is how your share will appear on social media
      </p>
    </motion.div>
  );
  
  const StepShare = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="py-6"
    >
      <h3 className="text-lg font-semibold mb-4">Share Now</h3>
      
      <div className="space-y-4 mb-6">
        <Button 
          onClick={() => shareToSocialMedia('twitter')}
          className="w-full bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
          </svg>
          Share on Twitter
        </Button>
        
        <Button 
          onClick={() => shareToSocialMedia('facebook')}
          className="w-full bg-[#1877F2] hover:bg-[#1877F2]/90 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
          </svg>
          Share on Facebook
        </Button>
        
        <div className="relative">
          <input 
            type="text" 
            value={shareUrl} 
            readOnly 
            className="w-full py-2 px-3 pr-24 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-muted"
          />
          <Button 
            onClick={copyToClipboard}
            className="absolute right-1 top-1 h-8"
            variant="secondary"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Event</DialogTitle>
          <DialogDescription>
            Share this event with your friends and social networks.
          </DialogDescription>
        </DialogHeader>
        
        {/* Animated steps */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 0 && <StepWelcome key="welcome" />}
            {step === 1 && <StepCustomize key="customize" />}
            {step === 2 && <StepPreview key="preview" />}
            {step === 3 && <StepShare key="share" />}
          </AnimatePresence>
        </div>
        
        {/* Progress indicator */}
        <div className="flex justify-center gap-2 my-2">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-primary' : 'w-4 bg-muted'}`}
            />
          ))}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            onClick={prevStep}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button 
            onClick={nextStep}
          >
            {step === 3 ? 'Done' : 'Next'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareStoryboard;