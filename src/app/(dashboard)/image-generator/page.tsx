'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ImageIcon,
  Loader2,
  Sparkles,
  Download,
} from 'lucide-react';

import { generateImage } from '@/ai/flows/generate-image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import AlchemyIcon from '@/components/icons/AlchemyIcon';
import MagicWandIcon from '@/components/icons/MagicWandIcon';

const formSchema = z.object({
  prompt: z
    .string()
    .min(10, 'Your prompt needs to be a bit more descriptive.')
    .max(1000, "That's a long prompt! Try to be more concise."),
});

export default function ImageGeneratorPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, startGenerating] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const handleGenerate = (values: z.infer<typeof formSchema>) => {
    setImageUrl(null); // Clear previous image
    startGenerating(async () => {
      try {
        const result = await generateImage(values);
        setImageUrl(result.imageUrl);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Oh no! The magic fizzled.',
          description:
            'There was a problem generating your image. Please try again.',
        });
      }
    });
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = 'peteai-generated-image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 flex flex-col items-center text-center">
        <ImageIcon className="mb-4 h-20 w-20 text-primary" />
        <h1 className="font-headline text-5xl font-bold tracking-tight text-primary">
          AI Image Generator
        </h1>
        <p className="mt-2 max-w-lg text-lg text-muted-foreground">
          Turn your words into stunning, unique visuals. Describe the image you
          want to create.
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="shadow-2xl shadow-primary/10">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleGenerate)}
              className="flex h-full flex-col"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                  <Sparkles className="h-8 w-8" />
                  Create Your Image
                </CardTitle>
                <CardDescription>
                  Describe the image you want the AI to generate. Be as
                  specific as you can!
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-lg">
                        <ImageIcon /> Your Prompt
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'A majestic lion with a crown made of stars, photorealistic, cinematic lighting, 8k'"
                          {...field}
                          className="min-h-[200px] p-4"
                        />
                      </FormControl>
                      <FormDescription>
                        Styles, subjects, colors, and moods all work well.
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
                  Generate Image
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6">
          {isGenerating && (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="animate-spin text-primary">
                <AlchemyIcon className="h-24 w-24" />
              </div>
              <h2 className="font-headline text-2xl text-primary">
                Creating Your Vision...
              </h2>
              <p className="max-w-md text-muted-foreground">
                The AI is painting your masterpiece. This may take a moment.
              </p>
            </div>
          )}

          {!isGenerating && imageUrl && (
             <div className="space-y-4 w-full animate-in fade-in">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                    <Image
                        src={imageUrl}
                        alt="AI generated image"
                        fill
                        className="object-cover"
                    />
                </div>
                 <Button onClick={downloadImage} className="w-full">
                    <Download className="mr-2"/>
                    Download Image
                 </Button>
            </div>
          )}

          {!isGenerating && !imageUrl && (
            <div className="text-center text-muted-foreground">
              <ImageIcon className="mx-auto h-24 w-24 opacity-30" />
              <p className="mt-4">Your generated image will appear here.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
