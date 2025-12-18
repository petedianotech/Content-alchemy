"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  Twitter,
  Loader2,
  ArrowLeft,
  Sparkles,
  Home,
} from "lucide-react";

import { generateTweet } from "@/ai/flows/generate-tweet";

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

type View = "form" | "loading" | "editor";

export default function TweetGenerator() {
  const [view, setView] = useState<View>("form");
  const [tweet, setTweet] = useState("");

  const [isGenerating, startGenerating] = useTransition();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      requirements: "",
    },
  });

  const handleGenerate = (values: z.infer<typeof formSchema>) => {
    setView("loading");
    startGenerating(async () => {
      try {
        const result = await generateTweet(values);
        setTweet(result.tweet);
        setView("editor");
        form.reset();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Oh no! The magic fizzled.",
          description: "There was a problem generating your tweet. Please try again.",
        });
        setView("form");
      }
    });
  };

  const handleStartOver = () => {
    setView("form");
    setTweet("");
  };

  if (view === "loading") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <div className="animate-spin text-primary">
          <AlchemyIcon className="h-24 w-24" />
        </div>
        <h1 className="font-headline text-3xl text-primary">
          Crafting Your Tweet...
        </h1>
        <p className="max-w-md text-muted-foreground">
          Our AI is writing a viral-worthy tweet. This will be quick!
        </p>
      </div>
    );
  }

  if (view === "editor") {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8 md:p-8">
        <div className="mb-4 flex justify-between">
            <Button variant="ghost" onClick={handleStartOver}>
            <ArrowLeft className="mr-2" />
            Start Over
            </Button>
            <Link href="/" passHref>
                <Button variant="outline">
                    <Home className="mr-2" />
                    Back to Home
                </Button>
            </Link>
        </div>
        <h1 className="font-headline text-4xl font-bold text-primary mb-4">
          Your AI-Generated Tweet
        </h1>
        <Textarea
          value={tweet}
          onChange={(e) => setTweet(e.target.value)}
          placeholder="Your magical tweet appears here..."
          className="h-[200px] flex-grow resize-none border-2 border-transparent bg-card p-4 text-lg leading-relaxed focus:border-primary"
        />
         <Button onClick={() => navigator.clipboard.writeText(tweet)} className="mt-4">
            Copy to Clipboard
        </Button>
      </div>
    );
  }

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
          AI Tweet Generator
        </h1>
        <p className="mt-2 max-w-lg text-lg text-muted-foreground">
          Generate engaging tweets for your X / Twitter feed in seconds.
        </p>
      </div>
      <Card className="w-full max-w-2xl shadow-2xl shadow-primary/10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerate)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                <Sparkles className="h-8 w-8" />
                Create a Tweet
              </CardTitle>
              <CardDescription>
                Tell our AI what you want to tweet about.
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
                  <MagicWandIcon className="mr-2 h-5 w-5" />
                )}
                Generate Tweet
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  );
}
