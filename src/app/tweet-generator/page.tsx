"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  Twitter,
  Loader2,
  Sparkles,
  Home,
  Send,
} from "lucide-react";

import { generateAndPostTweet } from "@/ai/flows/generate-and-post-tweet";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import AlchemyIcon from "@/components/icons/AlchemyIcon";
import MagicWandIcon from "@/components/icons/MagicWandIcon";

const formSchema = z.object({
  topic: z
    .string()
    .min(5, "Your topic needs to be a bit more descriptive.")
    .max(100, "That's a long topic! Try to be more concise."),
  requirements: z
    .string()
    .min(10, "Please provide some requirements for the AI.")
    .max(500, "Requirements are getting a bit long. Keep it focused!"),
});

export default function TweetGenerator() {
  const [isGenerating, startGenerating] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      requirements: "",
    },
  });

  const handleGenerateAndPost = (values: z.infer<typeof formSchema>) => {
    startGenerating(async () => {
      try {
        const result = await generateAndPostTweet(values);
        if (result.success && result.tweetId) {
          toast({
            title: "Tweet Posted!",
            description: "Your tweet is now live on X.",
            action: (
              <a
                href={`https://twitter.com/anyuser/status/${result.tweetId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">View Tweet</Button>
              </a>
            ),
          });
          form.reset();
        } else {
          throw new Error(result.error || "Failed to generate and post tweet.");
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Automation Failed",
          description: error.message || "Could not complete the process at this time.",
        });
      }
    });
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
       <Link href="/" passHref>
        <Button variant="ghost" className="absolute left-4 top-4">
          <Home className="mr-2" />
          Home
        </Button>
      </Link>
      <div className="mb-8 flex flex-col items-center text-center">
        <Twitter className="mb-4 h-20 w-20 text-primary" />
        <h1 className="font-headline text-5xl font-bold tracking-tight text-primary">
          Automated Tweet Generator
        </h1>
        <p className="mt-2 max-w-lg text-lg text-muted-foreground">
          Generate and post engaging tweets to your X / Twitter feed in a single click.
        </p>
      </div>
      <Card className="w-full max-w-2xl shadow-2xl shadow-primary/10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerateAndPost)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                <Sparkles className="h-8 w-8" />
                Create & Post a Tweet
              </CardTitle>
              <CardDescription>
                Tell our AI what you want to tweet about, and it will generate and post it for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg">
                      <Twitter /> Tweet Topic
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 'The importance of AI in business automation'"
                        {...field}
                        className="p-6 text-base"
                      />
                    </FormControl>
                    <FormDescription>
                      What's the main idea of your tweet?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg">
                      <Sparkles />
                      Magic Words (Requirements)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'Use a professional yet approachable tone. Include hashtags like #AI, #Business, and #Automation.'"
                        {...field}
                        className="min-h-[120px] p-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Specify tone, hashtags, and any other details.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                size="lg"
                className="w-full font-bold"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-5 w-5" />
                )}
                Generate and Post to X
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="animate-spin text-primary">
                <AlchemyIcon className="h-24 w-24" />
            </div>
            <h1 className="mt-4 font-headline text-2xl text-primary">
                Generating and Posting...
            </h1>
            <p className="max-w-sm text-center text-muted-foreground">
                Your tweet is being crafted and sent to X. Please wait a moment.
            </p>
        </div>
      )}
    </main>
  );
}
