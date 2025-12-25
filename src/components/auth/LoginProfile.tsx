
'use client';

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import Image from 'next/image';
import { useAuth, useUser } from '@/firebase';

import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useSidebar } from '../ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function LoginProfile() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { state } = useSidebar();

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  if (isUserLoading) {
    if (state === 'collapsed') {
      return <Skeleton className='size-8 rounded-full' />
    }
    return <Skeleton className="h-10 w-full" />;
  }

  if (!user) {
    return (
      <Button variant="ghost" className='w-full justify-start' onClick={handleGoogleSignIn}>
        <LogIn />
        <span className='group-data-[collapsible=icon]:hidden'>Login</span>
      </Button>
    );
  }

  if (state === 'collapsed') {
     return (
        <Avatar className="h-8 w-8">
            {user?.photoURL ? (
                <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
            ) : null}
            <AvatarFallback>
                <UserIcon className="h-5 w-5" />
            </AvatarFallback>
        </Avatar>
     )
  }

  return (
    <div className='flex w-full flex-col gap-2 rounded-lg bg-sidebar-accent p-2 text-sidebar-accent-foreground'>
       <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
               {user?.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                ) : null}
                <AvatarFallback>
                    <UserIcon className="h-5 w-5" />
                </AvatarFallback>
            </Avatar>
            <div className='flex flex-col truncate'>
                <p className="truncate text-sm font-medium leading-none">
                {user.displayName}
                </p>
                <p className="truncate text-xs leading-none text-muted-foreground">
                {user.email}
                </p>
            </div>
       </div>
      <Button variant="ghost" size="sm" className='w-full justify-start' onClick={handleSignOut}>
          <LogOut />
          <span>Log out</span>
      </Button>
    </div>
  );
}
