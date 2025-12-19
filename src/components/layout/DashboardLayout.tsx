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
} from 'lucide-react';

import AlchemyIcon from '@/components/icons/AlchemyIcon';
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
    href: '/my-posts',
    label: 'My Saved Posts',
    icon: Library,
    authRequired: true,
  },
];


export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href) && href !== '/';
  };

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="inset" collapsible="icon">
        <SidebarHeader className="items-center justify-center p-4">
          <Link href="/" className='flex items-center gap-2'>
            <AlchemyIcon className="size-8 text-primary" />
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
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
