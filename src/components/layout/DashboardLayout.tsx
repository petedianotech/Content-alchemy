
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
  Sparkles,
  Zap,
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
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const mainNav = [
  {
    href: '/',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/chat',
    label: 'AI Assistant',
    icon: MessageSquare,
  },
  {
    href: '/my-posts',
    label: 'Content Library',
    icon: Library,
    authRequired: true,
  },
];

const contentCreationNav = [
  {
    href: '/blog-post-generator',
    label: 'Blog Post Generator',
    icon: BookText,
  },
  {
    href: '/youtube-script-generator',
    label: 'YouTube Script Writer',
    icon: Youtube,
  },
  {
    href: '/image-generator',
    label: 'Image Generator',
    icon: ImageIcon,
  },
  {
    href: '/prompt-generator',
    label: 'Image Prompt Generator',
    icon: Sparkles,
  },
];

const socialNav = [
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
    href: '/facebook-post-generator',
    label: 'Facebook Post Generator',
    icon: Facebook,
  },
];

const projectsNav = [
  {
    href: '/book-generator',
    label: 'Book Writer',
    icon: BookOpen,
  },
];

const AccessDenied = () => (
  <div className="flex h-[calc(100vh-8rem)] w-full flex-col items-center justify-center gap-4 text-center">
    <ShieldAlert className="size-16 text-destructive" />
    <h1 className="text-3xl font-bold">Access Denied</h1>
    <p className="max-w-md text-muted-foreground">
      This application is restricted to the owner only. You do not have
      permission to access this page.
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
  const isUnauthorizedUser =
    user && !isOwner && primaryUserUid !== 'YOUR_FIREBASE_UID_HERE';

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href) && href !== '/';
  };

  const renderNavItems = (items: typeof mainNav) => {
    return items.map(item =>
      item.authRequired && !user ? null : (
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
    );
  };

  const navGroups = [
    { title: 'Content Creation', items: contentCreationNav },
    { title: 'Social & Automation', items: socialNav },
    { title: 'Projects', items: projectsNav },
  ];

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="inset" collapsible="icon">
        <SidebarHeader className="items-center justify-center p-4">
          <Link href="/" className="flex items-center gap-2">
            <PeteAiLogo className="size-8 text-primary" />
            <span className="font-headline text-2xl font-bold text-primary group-data-[collapsible=icon]:hidden">
              PeteAi
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>{renderNavItems(mainNav)}</SidebarMenu>
          <Accordion
            type="multiple"
            defaultValue={navGroups.map(g => g.title)}
            className="w-full space-y-1 group-data-[collapsible=icon]:hidden"
          >
            {navGroups.map(group => (
              <AccordionItem
                key={group.title}
                value={group.title}
                className="rounded-md border-none bg-sidebar-accent/50 px-2"
              >
                <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                  {group.title}
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <SidebarMenu className="pl-2 border-l border-sidebar-border ml-2">
                    {renderNavItems(group.items)}
                  </SidebarMenu>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="hidden group-data-[collapsible=icon]:block">
             <SidebarMenu>
                {renderNavItems(contentCreationNav)}
                {renderNavItems(socialNav)}
                {renderNavItems(projectsNav)}
             </SidebarMenu>
          </div>
        </SidebarContent>
        <SidebarFooter className="p-2">
          <LoginProfile />
        </SidebarFooter>
      </Sidebar>
      <div className="flex-1 md:ml-[var(--sidebar-width)] transition-all duration-300 ease-in-out group-data-[state=collapsed]:md:ml-[var(--sidebar-width-icon)]">
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:h-16">
          <SidebarTrigger className="md:hidden" />
          {/* Header content can go here if needed */}
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {isUnauthorizedUser ? <AccessDenied /> : children}
        </main>
      </div>
    </SidebarProvider>
  );
}
