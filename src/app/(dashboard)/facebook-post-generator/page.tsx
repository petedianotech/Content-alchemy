"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Facebook,
  Loader2,
  ArrowLeft,
  Sparkles,
  Save,
} from "lucide-react";
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';


import { generateFacebookPost } from "@/ai/flows/generate-facebook-post";

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
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";


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
type FormValues = z.infer<typeof formSchema>;


export default function FacebookPostGenerator() {
  const [view, setView] = useState<View>("form");
  const [post, setPost] = useState("");

  const [isGenerating, startGenerating] = useTransition();
  const [isSavingDefaults, startSavingDefaults] = useTransition();

  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      requirements: "",
    },
  });
  

  const handleGenerate = (values: FormValues) => {
    setView("loading");
    startGenerating(async () => {
      try {
        const result = await generateFacebookPost(values);
        setPost(result.post);
        setView("editor");
        form.reset();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Oh no! The magic fizzled.",
          description: "There was a problem generating your post. Please try again.",
        });
        setView("form");
      }
    });
  };

  const handleSaveDefaults = () => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "You must be logged in to save settings." });
      return;
    }
    startSavingDefaults(async () => {
      // For now, this just shows a toast. Later, it will save FB settings.
       const settingsDocRef = doc(firestore, 'users', user.uid, 'facebookSettings', 'default');
       const settingsData = {
          userId: user.uid,
          lastModified: serverTimestamp(),
          // We will add pageId and accessToken here later
        };
      
      setDoc(settingsDocRef, settingsData, { merge: true })
        .then(() => {
            toast({ title: "Automation settings saved!", description: "Connect your Facebook account in the next step." });
        })
        .catch((error) => {
            console.error("Error saving settings: ", error);
             const permissionError = new FirestorePermissionError({
                path: settingsDocRef.path,
                operation: 'write',
                requestResourceData: settingsData,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({ variant: "destructive", title: "Save Failed", description: "Could not save your settings." });
        });
    });
  };

  const handleStartOver = () => {
    setView("form");
    setPost("");
  };

  if (view === "loading") {
    return (
      <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4 text-center">
        <div className="animate-spin text-primary">
          <Loader2 className="h-24 w-24" />
        </div>
        <h1 className="font-headline text-3xl text-primary">
          Crafting Your Facebook Post...
        </h1>
        <p className="max-w-md text-muted-foreground">
          Our AI is whipping up a share-worthy post. Hang tight!
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
          Your Facebook Post
        </h1>
        <Textarea
          value={post}
          onChange={(e) => setPost(e.target.value)}
          placeholder="Your magical post appears here..."
          className="h-[300px] flex-grow resize-none border-2 border-transparent bg-card p-4 text-lg leading-relaxed focus:border-primary"
        />
         <Button onClick={() => navigator.clipboard.writeText(post)} className="mt-4">
            Copy to Clipboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 flex flex-col items-center text-center">
        <Facebook className="mb-4 h-20 w-20 text-primary" />
        <h1 className="font-headline text-5xl font-bold tracking-tight text-primary">
          AI Facebook Post Maker
        </h1>
        <p className="mt-2 max-w-lg text-lg text-muted-foreground">
          Generate engaging posts for your social media in seconds.
        </p>
      </div>
      <Card className="w-full max-w-2xl shadow-2xl shadow-primary/10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerate)}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                            <Sparkles className="h-8 w-8" />
                            Create a Post
                        </CardTitle>
                        <CardDescription>
                            Tell our AI what you want to post about.
                        </CardDescription>
                    </div>
                    <Button asChild variant="outline">
                      <a href="/api/auth/facebook/connect">
                        Connect to Facebook Page
                      </a>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg">
                      <Facebook /> Post Topic
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 'New product launch!'"
                        {...field}
                        className="p-6 text-base"
                      />
                    </FormControl>
                    <FormDescription>
                      What's the main idea of your post?
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
                        placeholder="e.g., 'Use an excited tone, include a question to boost engagement, and add relevant hashtags.'"
                        {...field}
                        className="min-h-[120px] p-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Specify tone, hashtags, and calls to action.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col gap-4 items-stretch">
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
                Generate Post
              </Button>
              <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSaveDefaults}
                    disabled={isSavingDefaults || !user}
                >
                    {isSavingDefaults ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    Save as Automation Default
                </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
