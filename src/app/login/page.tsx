
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import Link from 'next/link';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { BrainCircuit, ShieldAlert } from 'lucide-react';
import SplashScreen from '@/components/layout/SplashScreen';

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If the user is loaded and exists, redirect to the dashboard.
    if (!isUserLoading && user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };
  
  // While checking for user, you can show a loader or nothing
  if (isUserLoading) {
     return <SplashScreen />;
  }


  // If no user, show the login page
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

        <div className="mx-auto max-w-sm rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
                 <ShieldAlert className="h-6 w-6 text-muted-foreground" />
                <h3 className="font-semibold text-card-foreground">Admin Access Only</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
                This application is restricted to authorized administrators. Unauthorized access attempts will be denied.
            </p>
        </div>

        <Button 
          size="lg" 
          onClick={handleGoogleSignIn}
          className="w-full max-w-xs"
          disabled={!auth}
        >
          Sign In with Google
        </Button>
         <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{' '}
            <Link href="/terms-of-service" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
        </p>
      </div>
    </div>
  );
}
