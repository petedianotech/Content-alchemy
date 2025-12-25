
'use client';

import Link from 'next/link';
import {
  BookText,
  Facebook,
  Youtube,
  Image,
  BookOpen,
  Twitter,
  ArrowRight,
  MessageSquare,
  Sparkles,
  BarChart2,
  Library,
  ChevronRight,
} from 'lucide-react';
import { useUser } from '@/firebase';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const featureGroups = [
  {
    title: 'General',
    features: [
      {
        title: 'AI Assistant',
        description: 'Converse with an intelligent AI for questions and ideas.',
        href: '/chat',
        icon: <MessageSquare className="h-6 w-6 text-primary" />,
      },
      {
        title: 'Content Library',
        description: 'View and manage all your saved blog posts.',
        href: '/my-posts',
        icon: <Library className="h-6 w-6 text-primary" />,
      },
    ],
  },
  {
    title: 'Content Creation',
    features: [
      {
        title: 'Blog Post Generator',
        description: 'Create full-length, SEO-friendly blog articles.',
        href: '/blog-post-generator',
        icon: <BookText className="h-6 w-6 text-primary" />,
      },
      {
        title: 'YouTube Script Writer',
        description: 'Craft compelling scripts for your next viral video.',
        href: '/youtube-script-generator',
        icon: <Youtube className="h-6 w-6 text-primary" />,
      },
      {
        title: 'Image Generator',
        description: 'Turn your text prompts into stunning visuals.',
        href: '/image-generator',
        icon: <Image className="h-6 w-6 text-primary" />,
      },
      {
        title: 'Image Prompt Generator',
        description: 'Create detailed prompts for image generation AIs.',
        href: '/prompt-generator',
        icon: <Sparkles className="h-6 w-6 text-primary" />,
      },
    ],
  },
  {
    title: 'Social & Automation',
    features: [
      {
        title: 'Tweet Generator',
        description: 'Craft viral-worthy tweets and automate your posting.',
        href: '/tweet-generator',
        icon: <Twitter className="h-6 w-6 text-primary" />,
      },
      {
        title: 'Tweet Analytics',
        description: 'Track the performance of your posted tweets.',
        href: '/tweet-analytics',
        icon: <BarChart2 className="h-6 w-6 text-primary" />,
      },
      {
        title: 'Facebook Post Generator',
        description: 'Generate engaging posts for your Facebook page.',
        href: '/facebook-post-generator',
        icon: <Facebook className="h-6 w-6 text-primary" />,
      },
    ],
  },
  {
    title: 'Projects',
    features: [
      {
        title: 'Book Writer',
        description: 'Outline, write, and manage your next bestseller.',
        href: '/book-generator',
        icon: <BookOpen className="h-6 w-6 text-primary" />,
      },
    ],
  },
];

const FeatureLink = ({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <Link
    href={href}
    className="group flex items-center justify-between rounded-md p-4 transition-colors hover:bg-primary/10"
  >
    <div className="flex items-center gap-4">
      <div className="rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>
      <div>
        <h3 className="font-semibold text-card-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
  </Link>
);

export default function Home() {
  const { user } = useUser();

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
          Welcome back,{' '}
          {user?.displayName ? user.displayName.split(' ')[0] : 'Creator'}!
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          Your AI-powered control center for content creation. What will you
          create today?
        </p>
      </div>

      <div className="flex-grow">
        <Accordion
          type="multiple"
          defaultValue={featureGroups.map(g => g.title)}
          className="w-full space-y-4"
        >
          {featureGroups.map(group => (
            <AccordionItem
              key={group.title}
              value={group.title}
              className="rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <AccordionTrigger className="p-6 font-headline text-xl hover:no-underline">
                {group.title}
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <div className="flex flex-col gap-2">
                  {group.features.map(feature => (
                    <FeatureLink
                      key={feature.href}
                      href={feature.href}
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
