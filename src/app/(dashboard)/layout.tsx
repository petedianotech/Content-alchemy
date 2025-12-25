
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardLayout as InnerDashboardLayout } from '@/components/layout/DashboardLayout';
import SplashScreen from '@/components/layout/SplashScreen';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If auth state is not loading and there is no user, redirect to login.
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  // While checking for authentication, show a loading screen.
  if (isUserLoading || !user) {
    return <SplashScreen />;
  }

  // If the user is authenticated, render the dashboard layout.
  return <InnerDashboardLayout>{children}</InnerDashboardLayout>;
}
