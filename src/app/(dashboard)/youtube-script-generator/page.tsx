
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Youtube,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

import { generateYoutubeScript } from "@/ai/flows/generate-youtube-script";

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

export default function YoutubeScriptGenerator() {
  const [view, setView] = useState<View>("form");
  const [script, setScript] = useState("");

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
        const result = await generateYoutubeScript(values);
        setScript(result.script);
        setView("editor");
        form.reset();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Oh no! The magic fizzled.",
          description: "There was a problem generating your script. Please try again.",
        });
        setView("form");
      }
    });
  };

  const handleStartOver = () => {
    setView("form");
    setScript("");
  };

  if (view === "loading") {
    return (
      <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="h-24 w-24 animate-spin text-primary" />
        <h1 className="font-headline text-3xl text-primary">
          Writing Your YouTube Script...
        </h1>
        <p className="max-w-md text-muted-foreground">
          Our AI is scripting your next viral video. Action!
        </p>
      </div>
    );
  }

  if (view === "editor") {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-4">
            <Button variant="ghost" onClick={handleStartOver}>
            <ArrowLeft className="mr-2" />
            Start Over
            </Button>
        </div>
        <h1 className="font-headline text-4xl font-bold text-primary mb-4">
          Your YouTube Script
        </h1>
        <Textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Your amazing script appears here..."
          className="h-[500px] flex-grow resize-none border-2 border-transparent bg-card p-4 text-lg leading-relaxed focus:border-primary"
        />
        <Button onClick={() => navigator.clipboard.writeText(script)} className="mt-4">
            Copy to Clipboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 flex flex-col items-center text-center">
        <Youtube className="mb-4 h-20 w-20 text-primary" />
        <h1 className="font-headline text-5xl font-bold tracking-tight text-primary">
          AI YouTube Script Generator
        </h1>
        <p className="mt-2 max-w-lg text-lg text-muted-foreground">
          Craft compelling scripts for your next viral video.
        </p>
      </div>
      <Card className="w-full max-w-2xl shadow-2xl shadow-primary/10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerate)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                <Sparkles className="h-8 w-8" />
                Script Your Video
              </CardTitle>
              <CardDescription>
                Tell our AI what your video is about.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg">
                      <Youtube /> Video Topic
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 'How to make the perfect sourdough bread'"
                        {...field}
                        className="p-6 text-base"
                      />
                    </FormControl>
                    <FormDescription>
                      What's the main subject of your video?
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
                      Script Directives
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'Script for a 5-minute video. Casual and friendly tone. Include a hook, 3 main points, and a call to subscribe.'"
                        {...field}
                        className="min-h-[120px] p-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Specify tone, length, structure, and calls to action.
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
                Generate Script
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
