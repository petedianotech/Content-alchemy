
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  BookText,
  Facebook,
  Image as ImageIcon,
  Library,
  PanelLeft,
  Twitter,
  Youtube,
  Home,
  MessageSquare,
  ShieldAlert,
  BarChart2,
} from 'lucide-react';

import PeteAiLogo from '@/components/icons/PeteAiLogo';
import LoginProfile from '@/components/auth/LoginProfile';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';

const menuItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: Home,
  },
    {
    href: '/chat',
    label: 'Chat',
    icon: MessageSquare,
  },
  {
    href: '/blog-post-generator',
    label: 'Blog Post Generator',
    icon: BookText,
  },
  {
    href: '/facebook-post-generator',
    label: 'Facebook Post Maker',
    icon: Facebook,
  },
  {
    href: '/youtube-script-generator',
    label: 'YouTube Script Writer',
    icon: Youtube,
  },
  {
    href: '/prompt-generator',
    label: 'Prompt Generator',
    icon: ImageIcon,
  },
  {
    href: '/image-generator',
    label: 'Image Generator',
    icon: ImageIcon,
  },
  {
    href: '/book-generator',
    label: 'Book Generator',
    icon: BookOpen,
  },
  {
    href: '/tweet-generator',
    label: 'Tweet Generator',
    icon: Twitter,
  },
    {
    href: '/tweet-analytics',
    label: 'Tweet Analytics',
    icon: BarChart2,
    authRequired: true,
  },
  {
    href: '/my-posts',
    label: 'My Saved Posts',
    icon: Library,
    authRequired: true,
  },
];


const AccessDenied = () => (
    <div className="flex h-[calc(100vh-8rem)] w-full flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="size-16 text-destructive" />
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="max-w-md text-muted-foreground">
            This application is restricted to the owner only. You do not have permission to access this page.
        </p>
        <LoginProfile />
    </div>
);


export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();

  const primaryUserUid = process.env.NEXT_PUBLIC_PRIMARY_USER_UID;
  const isOwner = user && user.uid === primaryUserUid;
  const isUnauthorizedUser = user && !isOwner && primaryUserUid !== 'YOUR_FIREBASE_UID_HERE';

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href) && href !== '/';
  };
  

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="inset" collapsible="icon">
        <SidebarHeader className="items-center justify-center p-4">
          <Link href="/" className='flex items-center gap-2'>
            <PeteAiLogo className="size-8 text-primary" />
            <span className="font-headline text-2xl font-bold text-primary group-data-[collapsible=icon]:hidden">
              PeteAi
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {menuItems.map((item) =>
              (item.authRequired && !user) ? null : (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={{
                      children: item.label,
                    }}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
          <LoginProfile />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:h-16">
          <SidebarTrigger className='md:hidden' />
          {/* Header content can go here if needed */}
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
           {isUnauthorizedUser ? <AccessDenied /> : children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
