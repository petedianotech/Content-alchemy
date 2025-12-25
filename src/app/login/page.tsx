'use client';

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';

export default function LoginPage() {
  const auth = useAuth();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      if (auth) {
        await signInWithPopup(auth, provider);
      }
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_120%_at_50%_100%,hsl(var(--primary)/0.15),transparent)]" />
      <div className="w-full max-w-md space-y-8 text-center">
         <div className="relative mx-auto flex size-24 items-center justify-center rounded-full bg-gradient-to-tr from-primary/20 via-primary/5 to-primary/20">
            <div className="absolute inset-0.5 animate-spin-slow rounded-full bg-gradient-to-r from-primary via-primary/20 to-primary" />
            <BrainCircuit className="relative z-10 size-12 text-primary" />
           </div>
        <div>
          <h1 className="font-headline text-5xl font-bold tracking-tight text-primary">
            Welcome to PeteAi
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Sign in to access your AI-powered content creation suite.
          </p>
        </div>
        <Button 
          size="lg" 
          onClick={handleGoogleSignIn}
          className="w-full max-w-xs"
        >
          Sign In with Google
        </Button>
         <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
