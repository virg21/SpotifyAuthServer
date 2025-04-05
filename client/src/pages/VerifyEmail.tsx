import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import MobileLayout from '@/components/MobileLayout';

const emailVerificationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const verifyCodeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().min(6, 'Verification code must be at least 6 characters'),
});

const VerifyEmail: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Form for email input
  const emailForm = useForm<z.infer<typeof emailVerificationSchema>>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: {
      email: '',
    },
  });

  // Form for verification code
  const verifyForm = useForm<z.infer<typeof verifyCodeSchema>>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      email: '',
      code: '',
    },
  });

  // Handle sending verification code
  const onSendCode = async (values: z.infer<typeof emailVerificationSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/email/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Verification code sent!',
          description: 'Please check your email for the verification code',
        });
        setCodeSent(true);
        verifyForm.setValue('email', values.email);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to send verification code',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle verification of code
  const onVerifyCode = async (values: z.infer<typeof verifyCodeSchema>) => {
    setVerifying(true);
    try {
      const response = await fetch('/api/email/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Email verified!',
          description: 'Your email has been successfully verified.',
        });
        
        // Redirect to spotify connect page
        setTimeout(() => {
          setLocation('/connect-spotify');
        }, 2000);
      } else {
        toast({
          title: 'Verification failed',
          description: data.message || 'Failed to verify code',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <MobileLayout>
      <div className="flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
            <CardDescription className="text-center">
              {codeSent 
                ? 'Enter the verification code sent to your email' 
                : 'Verify your email to access exclusive features'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!codeSent ? (
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onSendCode)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="you@example.com" 
                            {...field} 
                            type="email" 
                            autoComplete="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-pink-600 to-pink-500"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Verification Code'
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...verifyForm}>
                <form onSubmit={verifyForm.handleSubmit(onVerifyCode)} className="space-y-4">
                  <FormField
                    control={verifyForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email" 
                            readOnly 
                            className="bg-gray-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={verifyForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter 6-digit code" 
                            {...field} 
                            autoComplete="one-time-code"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-600 to-green-500"
                    disabled={verifying}
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              {codeSent ? (
                <button 
                  className="text-pink-600 hover:underline" 
                  onClick={() => setCodeSent(false)}
                  type="button"
                >
                  Change email address
                </button>
              ) : (
                "We'll send a verification code to your email address"
              )}
            </p>
          </CardFooter>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default VerifyEmail;