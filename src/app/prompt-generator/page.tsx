"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  Image as ImageIcon,
  Loader2,
  ArrowLeft,
  Sparkles,
  Home,
  ClipboardCopy,
} from "lucide-react";

import { generateImagePrompt } from "@/ai/flows/generate-image-prompt";
import type { GenerateImagePromptOutput } from "@/ai/flows/generate-image-prompt";

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
    .min(3, "Your idea should be at least a few words.")
    .max(150, "That's a long idea! Try to be more concise."),
  requirements: z
    .string()
    .max(500, "Requirements are getting a bit long. Keep it focused!")
    .optional(),
});

type View = "form" | "loading" | "results";

export default function PromptGenerator() {
  const [view, setView] = useState<View>("form");
  const [results, setResults] = useState<GenerateImagePromptOutput | null>(null);
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
        const result = await generateImagePrompt(values);
        setResults(result);
        setView("results");
        form.reset();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Oh no! The inspiration failed.",
          description: "There was a problem generating your prompts. Please try again.",
        });
        setView("form");
      }
    });
  };
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: "You can now paste the prompt into your image generator.",
    });
  }

  const handleStartOver = () => {
    setView("form");
    setResults(null);
  };

  if (view === "loading") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <div className="animate-spin text-primary">
          <AlchemyIcon className="h-24 w-24" />
        </div>
        <h1 className="font-headline text-3xl text-primary">
          Engineering Your Prompts...
        </h1>
        <p className="max-w-md text-muted-foreground">
          Our AI prompt master is crafting the perfect words for your vision.
        </p>
      </div>
    );
  }

  if (view === "results") {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8 md:p-8">
        <div className="mb-4 flex justify-between">
          <Button variant="ghost" onClick={handleStartOver}>
            <ArrowLeft className="mr-2" />
            Create Another
          </Button>
          <Link href="/" passHref>
            <Button variant="outline">
              <Home className="mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
        <h1 className="font-headline text-4xl font-bold text-primary mb-6">
          Your Generated Prompts
        </h1>
        <div className="grid gap-6">
          {results?.prompts.map((prompt, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Prompt Variation {index + 1}
                  <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(prompt)}>
                    <ClipboardCopy className="h-5 w-5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-base">{prompt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
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
        <ImageIcon className="mb-4 h-20 w-20 text-primary" />
        <h1 className="font-headline text-5xl font-bold tracking-tight text-primary">
          AI Prompt Generator
        </h1>
        <p className="mt-2 max-w-lg text-lg text-muted-foreground">
          Create detailed, artistic prompts for Midjourney, DALL-E, and more.
        </p>
      </div>
      <Card className="w-full max-w-2xl shadow-2xl shadow-primary/10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerate)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                <Sparkles className="h-8 w-8" />
                Describe Your Vision
              </CardTitle>
              <CardDescription>
                Give the AI a starting point for your masterpiece.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg">
                      <ImageIcon /> Basic Idea
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 'A robot reading a book in a forest'"
                        {...field}
                        className="p-6 text-base"
                      />
                    </FormControl>
                    <FormDescription>
                      What is the core subject of your desired image?
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
                      Styles & Keywords (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'Impressionist style, vibrant colors, calm mood'"
                        {...field}
                        className="min-h-[120px] p-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Specify any desired art style, artist, mood, or colors.
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
                Generate Prompts
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  );
}
