"use client";

import Link from "next/link";
import { BookText, Facebook, Youtube, Image, BookOpen, Twitter, ArrowRight, MessageSquare, Sparkles, BarChart2, Library } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/firebase";

const NavCard = ({ href, icon, title, description }: { href: string, icon: React.ReactNode, title: string, description: string }) => (
  <Link href={href} className="group rounded-lg">
    <div
      className="flex flex-col justify-between h-full p-6 bg-card border border-border/20 shadow-sm transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:scale-105 group-hover:bg-gradient-to-br from-card to-primary/10 rounded-lg"
    >
      <div>
        <div className="mb-4 flex items-center justify-center p-3 rounded-lg bg-primary/10 text-primary w-fit">
          {icon}
        </div>
        <h2 className="font-headline text-xl mb-1 text-card-foreground">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm">
          {description}
        </p>
      </div>
      <div className="mt-6 flex items-center justify-end text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Start Creating <ArrowRight className="ml-2 h-4 w-4" />
      </div>
    </div>
  </Link>
);


const featureGroups = [
  {
    title: "General",
    features: [
       {
        title: "AI Assistant",
        description: "Converse with an intelligent AI assistant for questions and ideas.",
        href: "/chat",
        icon: <MessageSquare className="h-8 w-8" />,
      },
      {
        title: "Content Library",
        description: "View and manage all your saved blog posts.",
        href: "/my-posts",
        icon: <Library className="h-8 w-8" />,
      },
    ]
  },
  {
    title: "Content Creation",
    features: [
       {
        title: "Blog Post Generator",
        description: "Create full-length, SEO-friendly blog articles.",
        href: "/blog-post-generator",
        icon: <BookText className="h-8 w-8" />,
      },
      {
        title: "YouTube Script Writer",
        description: "Craft compelling scripts for your next viral video.",
        href: "/youtube-script-generator",
        icon: <Youtube className="h-8 w-8" />,
      },
      {
        title: "Image Generator",
        description: "Turn your text prompts into stunning visuals.",
        href: "/image-generator",
        icon: <Image className="h-8 w-8" />,
      },
      {
        title: "Image Prompt Generator",
        description: "Create detailed prompts for image generation AIs.",
        href: "/prompt-generator",
        icon: <Sparkles className="h-8 w-8" />,
      },
    ]
  },
  {
    title: "Social & Automation",
    features: [
      {
        title: "Tweet Generator",
        description: "Craft viral-worthy tweets and automate your posting.",
        href: "/tweet-generator",
        icon: <Twitter className="h-8 w-8" />,
      },
       {
        title: "Tweet Analytics",
        description: "Track the performance of your posted tweets.",
        href: "/tweet-analytics",
        icon: <BarChart2 className="h-8 w-8" />,
      },
      {
        title: "Facebook Post Generator",
        description: "Generate engaging posts for your Facebook page.",
        href: "/facebook-post-generator",
        icon: <Facebook className="h-8 w-8" />,
      },
    ]
  },
  {
    title: "Projects",
    features: [
      {
        title: "Book Writer",
        description: "Outline, write, and manage your next bestseller.",
        href: "/book-generator",
        icon: <BookOpen className="h-8 w-8" />,
      },
    ]
  },
];

export default function Home() {
    const { user } = useUser();

  return (
    <div className="flex flex-col space-y-12">
      <div>
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
          Welcome back, {user?.displayName ? user.displayName.split(' ')[0] : 'Creator'}!
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          Your AI-powered control center for content creation. What will you create today?
        </p>
      </div>
      
      {featureGroups.map((group) => (
        <div key={group.title}>
          <h2 className="text-2xl font-headline font-bold text-card-foreground mb-4">{group.title}</h2>
          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.features.map((feature) => (
                  <NavCard
                      key={feature.href}
                      href={feature.href}
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                  />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
