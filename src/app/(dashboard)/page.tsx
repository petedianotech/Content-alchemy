
"use client";

import Link from "next/link";
import { BookText, Facebook, Youtube, Image, BookOpen, Twitter, ArrowRight, MessageSquare } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {

  const features = [
      {
      title: "AI Chat",
      description: "Converse with an intelligent AI assistant.",
      href: "/chat",
      icon: <MessageSquare className="h-8 w-8" />,
    },
    {
      title: "AI Blog Post Generator",
      description: "Create full-length, SEO-friendly blog articles.",
      href: "/blog-post-generator",
      icon: <BookText className="h-8 w-8" />,
    },
    {
      title: "AI Image Generator",
      description: "Turn your text prompts into stunning visuals.",
      href: "/image-generator",
      icon: <Image className="h-8 w-8" />,
    },
    {
      title: "AI Facebook Post Maker",
      description: "Generate engaging posts for your social media.",
      href: "/facebook-post-generator",
      icon: <Facebook className="h-8 w-8" />,
    },
    {
      title: "AI YouTube Script Generator",
      description: "Craft compelling scripts for your next viral video.",
      href: "/youtube-script-generator",
      icon: <Youtube className="h-8 w-8" />,
    },
    {
      title: "AI Prompt Generator",
      description: "Create detailed prompts for image generation AIs.",
      href: "/prompt-generator",
      icon: <Image className="h-8 w-8" />,
    },
    {
      title: "AI Book Generator",
      description: "Outline and generate your next bestseller.",
      href: "/book-generator",
      icon: <BookOpen className="h-8 w-8" />,
    },
     {
      title: "AI Tweet Generator",
      description: "Craft viral-worthy tweets in an instant.",
      href: "/tweet-generator",
      icon: <Twitter className="h-8 w-8" />,
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="mb-12 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-6xl">
          Welcome to PeteAi
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Your AI-powered control center for content creation and automation. Select a tool to get started.
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.href} className="group">
            <Card
              className="flex flex-col justify-between h-full p-6 bg-card/50 backdrop-blur-sm border-border/20 shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-primary/20 hover:scale-105"
            >
              <div>
                <div className="mb-4 flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary w-fit">
                  {feature.icon}
                </div>
                <CardTitle className="font-headline text-xl mb-2">
                  {feature.title}
                </CardTitle>
                <CardDescription>
                  {feature.description}
                </CardDescription>
              </div>
              <div className="mt-6 flex items-center justify-end text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Start Creating <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
