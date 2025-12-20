
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import {
  BookText,
  Download,
  Lightbulb,
  Loader2,
  ShieldCheck,
  FileText,
  FileCode,
  FileSignature,
  ArrowLeft,
  Sparkles,
  Facebook,
  Save,
} from "lucide-react";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc
} from 'firebase/firestore';


import { generateBlogPostDraft } from "@/ai/flows/generate-blog-post-draft";
import { provideAiSuggestions } from "@/ai/flows/provide-ai-suggestions";
import { ensureAdsenseCompliance } from "@/ai/flows/ensure-adsense-compliance";
import { generateFacebookPost } from "@/ai/flows/generate-facebook-post";
import type { ProvideAiSuggestionsOutput } from "@/ai/flows/provide-ai-suggestions";
import type { EnsureAdsenseComplianceOutput } from "@/ai/flows/ensure-adsense-compliance";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import QuillIcon from "@/components/icons/QuillIcon";
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

type FormValues = z.infer<typeof formSchema>;
type View = "form" | "loading" | "editor";

export default function BlogPostGenerator() {
  const [view, setView] = useState<View>("form");
  const [draft, setDraft] = useState({ topic: "", title: "", content: "" });
  const [facebookPost, setFacebookPost] = useState<string>("");
  const [aiSuggestions, setAiSuggestions] =
    useState<ProvideAiSuggestionsOutput | null>(null);
  const [adsenseResult, setAdsenseResult] =
    useState<EnsureAdsenseComplianceOutput | null>(null);

  const { user } = useUser();
  const firestore = useFirestore();

  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [isSavingDefaults, startSavingDefaults] = useTransition();
  const [isSuggesting, startSuggesting] = useTransition();
  const [isChecking, startChecking] = useTransition();
  const [isGeneratingFacebook, startGeneratingFacebook] = useTransition();

  const { toast } = useToast();

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
        const result = await generateBlogPostDraft(values);
        const [title, ...contentParts] = result.draft.split("\n\n");
        setDraft({ topic: values.topic, title, content: contentParts.join("\n\n") });
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

  const handleSavePost = () => {
    if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to save a post.",
        });
        return;
    }

    startSaving(async () => {
        const postData = {
            userId: user.uid,
            title: draft.title,
            content: draft.content,
            topic: draft.topic,
            creationDate: serverTimestamp(),
            lastModified: serverTimestamp(),
        };

        const postsCollection = collection(firestore, 'users', user.uid, 'blogPosts');

        addDoc(postsCollection, postData)
          .then((docRef) => {
            toast({
                title: "Post Saved!",
                description: "Your masterpiece has been saved to your collection.",
            });
          })
          .catch((error) => {
            console.error("Error saving document: ", error);
            const permissionError = new FirestorePermissionError({
                path: postsCollection.path,
                operation: 'create',
                requestResourceData: postData,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "Could not save your post. Check permissions and try again.",
            });
          });
    });
};

const handleSaveDefaults = (values: FormValues) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "You must be logged in to save settings." });
      return;
    }
    startSavingDefaults(async () => {
      const settingsDocRef = doc(firestore, 'users', user.uid, 'blogSettings', 'default');
      const settingsData = {
        ...values,
        userId: user.uid,
        lastModified: serverTimestamp(),
      };
      
      setDoc(settingsDocRef, settingsData, { merge: true })
        .then(() => {
            toast({ title: "Default settings saved!", description: "The scheduled blog posts will now use these settings." });
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

  const handleGetSuggestions = () => {
    startSuggesting(async () => {
      try {
        const result = await provideAiSuggestions({
          blogPostContent: `${draft.title}\n\n${draft.content}`,
        });
        setAiSuggestions(result);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Suggestion Spell Failed",
          description: "Could not fetch AI suggestions at this time.",
        });
      }
    });
  };

  const handleCheckCompliance = () => {
    startChecking(async () => {
      try {
        const result = await ensureAdsenseCompliance({
          content: `${draft.title}\n\n${draft.content}`,
        });
        setAdsenseResult(result);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Compliance Check Failed",
          description: "Could not perform AdSense check at this time.",
        });
      }
    });
  };
  
  const handleGenerateFacebookPost = () => {
    startGeneratingFacebook(async () => {
      try {
        const result = await generateFacebookPost({
          topic: draft.title,
          requirements: 'Summarize the blog post for facebook',
        });
        setFacebookPost(result.post);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Facebook Post Generation Failed",
          description: "Could not generate a Facebook post at this time.",
        });
      }
    });
  }

  const downloadAs = (format: "txt" | "html" | "md") => {
    let content = "";
    let mimeType = "";
    let fileExtension = format;

    const fullContent = `# ${draft.title}\n\n${draft.content}`;

    if (format === "txt" || format === "md") {
      content = fullContent;
      mimeType = "text/plain";
    } else if (format === "html") {
      content = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${draft.title}</title>
          <style>body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 2rem auto; padding: 1rem; } h1 { color: #333; } p { color: #555; }</style>
        </head>
        <body>
          <h1>${draft.title}</h1>
          ${draft.content
            .split("\n")
            .map((p) => `<p>${p}</p>`)
            .join("")}
        </body>
        </html>`;
      mimeType = "text/html";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${draft.title
      .toLowerCase()
      .replace(/\s+/g, "-")}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleStartOver = () => {
    setView("form");
    setDraft({ topic: "", title: "", content: "" });
    setAiSuggestions(null);
    setAdsenseResult(null);
    setFacebookPost("");
  };

  if (view === "loading") {
    return (
      <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="h-24 w-24 animate-spin text-primary" />
        <h1 className="font-headline text-3xl text-primary">
          Brewing Your Content...
        </h1>
        <p className="max-w-md text-muted-foreground">
          Our AI alchemists are mixing the perfect words for your topic. This
          won't take long!
        </p>
      </div>
    );
  }

  if (view === "editor") {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleStartOver}>
            <ArrowLeft className="mr-2" />
            Start Over
            </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h1 className="font-headline text-4xl font-bold text-primary">
                Refine Your Draft
              </h1>
              {user && (
                  <Button onClick={handleSavePost} disabled={isSaving}>
                      {isSaving ? (
                          <Loader2 className="animate-spin" />
                      ) : (
                          <Save className="mr-2" />
                      )}
                      Save Post
                  </Button>
              )}
            </div>
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Your Amazing Title"
              className="border-2 border-transparent bg-card p-4 text-2xl font-bold focus:border-primary"
            />
            <Textarea
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              placeholder="Your magical content appears here..."
              className="h-[500px] flex-grow resize-none border-2 border-transparent bg-card p-4 text-lg leading-relaxed focus:border-primary"
            />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <Download /> One-Click Export
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button onClick={() => downloadAs("txt")}>
                  <FileText />
                  .txt
                </Button>
                <Button onClick={() => downloadAs("md")}>
                  <FileSignature />
                  .md
                </Button>
                <Button onClick={() => downloadAs("html")}>
                  <FileCode />
                  .html
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col gap-6">
            <Tabs defaultValue="suggestions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
                <TabsTrigger value="adsense">AdSense Check</TabsTrigger>
                <TabsTrigger value="facebook">Facebook Post</TabsTrigger>
              </TabsList>
              <TabsContent value="suggestions">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                      <Lightbulb /> AI Suggestions
                    </CardTitle>
                    <CardDescription>
                      Spark your creativity with these ideas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={handleGetSuggestions}
                      disabled={isSuggesting}
                      className="w-full"
                    >
                      {isSuggesting ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Sparkles className="mr-2" />
                      )}
                      Get Suggestions
                    </Button>
                    {aiSuggestions && (
                      <div className="space-y-4 animate-in fade-in">
                        <div>
                          <h4 className="font-headline text-lg font-semibold">
                            Headline Ideas
                          </h4>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {aiSuggestions.headlineSuggestions.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-headline text-lg font-semibold">
                            Paragraph Rewrites
                          </h4>
                          {aiSuggestions.paragraphRewrites.map((p, i) => (
                            <p
                              key={i}
                              className="mt-2 rounded-md border bg-muted p-2 text-sm italic text-muted-foreground"
                            >
                              {p}
                            </p>
                          ))}
                        </div>
                        <div>
                          <h4 className="font-headline text-lg font-semibold">
                            Featured Image
                          </h4>
                          <p className="text-muted-foreground">
                            {aiSuggestions.featuredImageSuggestions}
                          </p>
                          <div className="mt-2 overflow-hidden rounded-lg">
                            <Image
                              src={PlaceHolderImages[0].imageUrl}
                              alt={PlaceHolderImages[0].description}
                              width={800}
                              height={600}
                              data-ai-hint={PlaceHolderImages[0].imageHint}
                              className="aspect-[4/3] w-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="adsense">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                      <ShieldCheck /> AdSense Compliance
                    </CardTitle>
                    <CardDescription>
                      Check if your post is ad-friendly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={handleCheckCompliance}
                      disabled={isChecking}
                      className="w-full"
                    >
                      {isChecking ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Run Check"
                      )}
                    </Button>
                    {adsenseResult && (
                      <Alert
                        variant={
                          adsenseResult.isCompliant ? "default" : "destructive"
                        }
                        className="animate-in fade-in"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <AlertTitle>
                          {adsenseResult.isCompliant
                            ? "Looks Good!"
                            : "Needs Attention"}
                        </AlertTitle>
                        <AlertDescription>
                          {adsenseResult.suggestions}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="facebook">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                      <Facebook /> Facebook Post
                    </CardTitle>
                    <CardDescription>
                      Generate a Facebook post from your content.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={handleGenerateFacebookPost}
                      disabled={isGeneratingFacebook}
                      className="w-full"
                    >
                      {isGeneratingFacebook ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Generate Facebook Post"
                      )}
                    </Button>
                    {facebookPost && (
                       <div className="space-y-4 animate-in fade-in">
                         <Textarea
                           value={facebookPost}
                           onChange={(e) => setFacebookPost(e.target.value)}
                           placeholder="Your magical content appears here..."
                           className="h-[200px] flex-grow resize-none border-2 border-transparent bg-muted p-4 text-base leading-relaxed focus:border-primary"
                         />
                       </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 flex flex-col items-center text-center">
        <QuillIcon className="mb-4 h-20 w-20 text-primary" />
        <h1 className="font-headline text-5xl font-bold tracking-tight text-primary">
          AI Blog Post Generator
        </h1>
        <p className="mt-2 max-w-lg text-lg text-muted-foreground">
          Transform your ideas into undetectable, AdSense-ready blog posts with
          the power of AI.
        </p>
      </div>
      <Card className="w-full max-w-2xl shadow-2xl shadow-primary/10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerate)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                <BookText className="h-8 w-8" />
                Start Your Masterpiece
              </CardTitle>
              <CardDescription>
                Tell our AI what you want to write about.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg">
                      <BookText /> Blog Post Topic
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 'The Future of Renewable Energy'"
                        {...field}
                        className="p-6 text-base"
                      />
                    </FormControl>
                    <FormDescription>
                      What's the core subject of your post?
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
                        placeholder="e.g., 'Write in a witty and engaging tone. Target audience is young professionals. Include keywords like solar, wind, and sustainability.'"
                        {...field}
                        className="min-h-[120px] p-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Specify tone, keywords, and target audience.
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
                    onClick={form.handleSubmit(handleSaveDefaults)}
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

    