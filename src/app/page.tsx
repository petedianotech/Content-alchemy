"use client";

import Link from "next/link";
import { BookText, Facebook, Youtube, Image, BookOpen, Twitter } from "lucide-react";
import AlchemyIcon from "@/components/icons/AlchemyIcon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const features = [
    {
      title: "AI Blog Post Generator",
      description: "Create full-length, SEO-friendly blog articles.",
      href: "/blog-post-generator",
      icon: <BookText className="h-8 w-8 text-primary" />,
    },
    {
      title: "AI Facebook Post Maker",
      description: "Generate engaging posts for your social media.",
      href: "/facebook-post-generator",
      icon: <Facebook className="h-8 w-8 text-primary" />,
    },
    {
      title: "AI YouTube Script Generator",
      description: "Craft compelling scripts for your next viral video.",
      href: "/youtube-script-generator",
      icon: <Youtube className="h-8 w-8 text-primary" />,
    },
    {
      title: "AI Prompt Generator",
      description: "Create detailed prompts for image generation AIs.",
      href: "/prompt-generator",
      icon: <Image className="h-8 w-8 text-primary" />,
    },
    {
      title: "AI Book Generator",
      description: "Outline and generate your next bestseller.",
      href: "/book-generator",
      icon: <BookOpen className="h-8 w-8 text-primary" />,
    },
     {
      title: "AI Tweet Generator",
      description: "Craft viral-worthy tweets in an instant.",
      href: "/tweet-generator",
      icon: <Twitter className="h-8 w-8 text-primary" />,
    },
  ];

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <AlchemyIcon className="mb-4 h-20 w-20 text-primary" />
        <h1 className="font-headline text-5xl font-bold tracking-tight text-primary">
          PeteAi
        </h1>
        <p className="mt-2 max-w-lg text-lg text-muted-foreground">
          AI Automation solutions to streamline your content creation process.
        </p>
      </div>
      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.href}
            className="flex flex-col justify-between shadow-lg transition-transform hover:scale-105"
          >
            <CardHeader>
              <div className="mb-4 flex justify-center">{feature.icon}</div>
              <CardTitle className="text-center font-headline text-xl">
                {feature.title}
              </CardTitle>
              <CardDescription className="text-center">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={feature.href} passHref>
                <Button className="w-full font-bold">Get Started</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
