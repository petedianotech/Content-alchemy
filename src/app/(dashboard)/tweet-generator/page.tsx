"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Twitter,
  Loader2,
  Sparkles,
  Send,
  ClipboardCopy,
  RefreshCcw,
} from "lucide-react";

import { generateTweet } from "@/ai/flows/generate-tweet";
import { postTweet } from "@/ai/flows/post-tweet";

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  topic: z
    .string()
    .min(5, "Your topic needs to be a bit more descriptive.")
    .max(100, "That's a long topic! Try to be more concise."),
  style: z.string().optional(),
  tone: z.string().optional(),
  viral: z.boolean().default(false),
  keywords: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TweetGenerator() {
  const [generatedTweet, setGeneratedTweet] = useState("");
  const [isGenerating, startGenerating] = useTransition();
  const [isPosting, startPosting] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      style: "Friendly",
      tone: "Informative",
      viral: true,
      keywords: "",
    },
  });

  const handleGenerate = (values: FormValues) => {
    startGenerating(async () => {
      setGeneratedTweet("");
      try {
        const result = await generateTweet(values);
        setGeneratedTweet(result.tweet);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: error.message || "Could not generate the tweet at this time.",
        });
      }
    });
  };

  const handlePostTweet = () => {
    if (!generatedTweet) return;
    startPosting(async () => {
      try {
        const result = await postTweet({ tweet: generatedTweet });
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
        } else {
          throw new Error(result.error || "Failed to post tweet.");
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Posting Failed",
          description: error.message || "Could not post the tweet at this time.",
        });
      }
    });
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedTweet);
    toast({
      title: "Copied to clipboard!",
    });
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 flex flex-col items-center text-center">
        <Twitter className="mb-4 h-20 w-20 text-primary" />
        <h1 className="font-headline text-5xl font-bold tracking-tight text-primary">
          AI Tweet Generator
        </h1>
        <p className="mt-2 max-w-lg text-lg text-muted-foreground">
          Craft viral-worthy tweets with advanced customization and AI-powered suggestions.
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="shadow-2xl shadow-primary/10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerate)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                  <Sparkles className="h-8 w-8" />
                  Create a Tweet
                </CardTitle>
                <CardDescription>
                  Customize your tweet with advanced options.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niche / Topic</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 'The future of AI in marketing'"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Writing Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a writing style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Professional">Professional</SelectItem>
                          <SelectItem value="Friendly">Friendly</SelectItem>
                          <SelectItem value="Humorous">Humorous</SelectItem>
                          <SelectItem value="Authoritative">Authoritative</SelectItem>
                          <SelectItem value="Witty">Witty</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tweet Tone</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Informative">Informative</SelectItem>
                          <SelectItem value="Inspirational">Inspirational</SelectItem>
                          <SelectItem value="Question">Question</SelectItem>
                          <SelectItem value="Controversial">Controversial</SelectItem>
                          <SelectItem value="Educational">Educational</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keywords / Hashtags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., #AI, #Innovation"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Comma-separated keywords or hashtags.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="viral"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Optimize for Virality</FormLabel>
                        <FormDescription>
                          AI will use techniques to maximize engagement.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
                    <Sparkles className="mr-2 h-5 w-5" />
                  )}
                  Generate Tweet
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="flex flex-col shadow-2xl shadow-primary/10">
           <CardHeader>
                <CardTitle className="font-headline text-2xl">Generated Tweet</CardTitle>
                <CardDescription>Review, copy, or post your generated tweet directly to X.</CardDescription>
            </CardHeader>
             <CardContent className="flex-grow flex items-center justify-center">
                 {isGenerating ? (
                     <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                        <p>Generating your tweet...</p>
                     </div>
                 ) : generatedTweet ? (
                     <Textarea
                        value={generatedTweet}
                        onChange={(e) => setGeneratedTweet(e.target.value)}
                        className="h-full w-full text-base resize-none"
                     />
                 ) : (
                    <div className="text-center text-muted-foreground">
                        <Twitter className="mx-auto h-16 w-16 opacity-20" />
                        <p className="mt-4">Your generated tweet will appear here.</p>
                    </div>
                 )}
             </CardContent>
             <CardFooter className="flex-col gap-4 items-stretch">
                <Button onClick={handlePostTweet} disabled={!generatedTweet || isPosting || isGenerating}>
                     {isPosting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     ) : (
                        <Send className="mr-2 h-5 w-5" />
                     )}
                     Post to X
                </Button>
                <div className="flex gap-4">
                     <Button variant="outline" className="w-full" onClick={() => form.handleSubmit(handleGenerate)()} disabled={isGenerating}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Regenerate
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={handleCopyToClipboard} disabled={!generatedTweet}>
                        <ClipboardCopy className="mr-2 h-4 w-4" />
                        Copy
                    </Button>
                </div>
             </CardFooter>
        </Card>
      </div>
    </div>
  );
}
