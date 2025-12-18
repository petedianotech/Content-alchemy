"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BookOpen,
  Loader2,
  ArrowLeft,
  Sparkles,
  BookMarked,
  Layers,
} from "lucide-react";

import { generateBookOutline } from "@/ai/flows/generate-book-outline";
import type { GenerateBookOutlineOutput } from "@/ai/flows/generate-book-outline";

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast";
import AlchemyIcon from "@/components/icons/AlchemyIcon";
import MagicWandIcon from "@/components/icons/MagicWandIcon";
import { Slider } from "@/components/ui/slider";

const formSchema = z.object({
  genre: z
    .string()
    .min(3, "Please specify a genre."),
  idea: z
    .string()
    .min(10, "Your idea needs to be a bit more descriptive.")
    .max(500, "That's a long idea! Try to be more concise."),
  chapters: z.number().min(5).max(50).default(25),
});

type View = "form" | "loading" | "results";

export default function BookGenerator() {
  const [view, setView] = useState<View>("form");
  const [results, setResults] = useState<GenerateBookOutlineOutput | null>(null);
  const [isGenerating, startGenerating] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      genre: "",
      idea: "",
      chapters: 25,
    },
  });

  const handleGenerate = (values: z.infer<typeof formSchema>) => {
    setView("loading");
    startGenerating(async () => {
      try {
        const result = await generateBookOutline(values);
        setResults(result);
        setView("results");
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Oh no! The story couldn't start.",
          description: "There was a problem outlining your book. Please try again.",
        });
        setView("form");
      }
    });
  };

  const handleStartOver = () => {
    setView("form");
    setResults(null);
    form.reset();
  };

  if (view === "loading") {
    return (
      <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4 text-center">
        <div className="animate-spin text-primary">
          <AlchemyIcon className="h-24 w-24" />
        </div>
        <h1 className="font-headline text-3xl text-primary">
          Writing Your Epic...
        </h1>
        <p className="max-w-md text-muted-foreground">
          Our AI novelist is outlining your story, from the first page to the last.
        </p>
      </div>
    );
  }

  if (view === "results") {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-4">
          <Button variant="ghost" onClick={handleStartOver}>
            <ArrowLeft className="mr-2" />
            Create Another
          </Button>
        </div>
        <h1 className="font-headline text-4xl font-bold text-primary mb-6">
          Your Book Outline
        </h1>
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <BookMarked /> Title Suggestions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc space-y-2 pl-5 text-lg">
                        {results?.titles.map((title, index) => (
                            <li key={index}>{title}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            <div className="md:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline">
                            <Layers /> Chapter Outline
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {results?.outline.map((chapter, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger className="text-lg">
                                        Chapter {index + 1}: {chapter.title}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-base text-muted-foreground">
                                        {chapter.description}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 flex flex-col items-center text-center">
        <BookOpen className="mb-4 h-20 w-20 text-primary" />
        <h1 className="font-headline text-5xl font-bold tracking-tight text-primary">
          AI Book Generator
        </h1>
        <p className="mt-2 max-w-lg text-lg text-muted-foreground">
          From a simple idea to a full chapter-by-chapter outline, start your bestseller here.
        </p>
      </div>
      <Card className="w-full max-w-2xl shadow-2xl shadow-primary/10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerate)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                <Sparkles className="h-8 w-8" />
                Describe Your Book
              </CardTitle>
              <CardDescription>
                Provide the genre and plot for your story.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg">
                      <BookMarked /> Genre
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 'Dystopian Sci-Fi', 'Cozy Mystery', 'High Fantasy'"
                        {...field}
                        className="p-6 text-base"
                      />
                    </FormControl>
                    <FormDescription>
                      What is the genre of your book?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="idea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg">
                      <Sparkles />
                      Your Big Idea
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'In a world where emotions are currency, a young woman who feels nothing must go on a quest to save her family.'"
                        {...field}
                        className="min-h-[120px] p-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Briefly describe the plot or main concept.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="chapters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg">
                       <Layers /> Number of Chapters ({field.value})
                    </FormLabel>
                     <FormControl>
                      <Slider
                        min={5}
                        max={50}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                     <FormDescription>
                      Choose how many chapters you want in your book.
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
                Generate Outline
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
