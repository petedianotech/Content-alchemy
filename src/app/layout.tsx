import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from "@vercel/analytics/react"
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';


export const metadata: Metadata = {
  title: {
    template: '%s | PeteAi',
    default: 'PeteAi - AI Automation',
  },
  description: 'AI Automation solutions by PeteAi to streamline your content creation process.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </FirebaseClientProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
