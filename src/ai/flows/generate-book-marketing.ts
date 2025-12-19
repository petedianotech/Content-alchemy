
'use server';

/**
 * @fileOverview Generates marketing materials for a book project.
 *
 * - generateBookMarketing - A function that generates marketing materials.
 * - GenerateBookMarketingInput - The input type for the function.
 * - GenerateBookMarketingOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBookMarketingInputSchema = z.object({
  title: z.string().describe("The final title of the book."),
  genre: z.string().describe("The genre of the book."),
  mood: z.string().describe("The mood of the book."),
  idea: z.string().describe("A summary of the book's overall plot or idea."),
});
export type GenerateBookMarketingInput = z.infer<typeof GenerateBookMarketingInputSchema>;

const GenerateBookMarketingOutputSchema = z.object({
  coverImagePrompt: z.string().describe("A highly detailed DALL-E or Midjourney prompt to generate a visually stunning and marketable book cover. The prompt must include the book title as text."),
  bookDescription: z.string().describe("A compelling, professional book description suitable for online retailers like Amazon KDP. It should be engaging and include a strong hook."),
  pricingSuggestion: z.string().describe("A suggested retail price for the eBook and paperback, with a brief justification based on genre and market standards."),
});
export type GenerateBookMarketingOutput = z.infer<typeof GenerateBookMarketingOutputSchema>;

export async function generateBookMarketing(input: GenerateBookMarketingInput): Promise<GenerateBookMarketingOutput> {
  return generateBookMarketingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBookMarketingPrompt',
  input: {schema: GenerateBookMarketingInputSchema},
  output: {schema: GenerateBookMarketingOutputSchema},
  prompt: `You are a world-class book marketing expert for a major publishing house. Your task is to generate a complete marketing kit for a new book.

Here is the context for the book:
- Title: {{{title}}}
- Genre: {{{genre}}}
- Mood: {{{mood}}}
- Book Idea: {{{idea}}}

Based on this information, generate the following three items:

1.  **Cover Image Prompt:** Create one single, highly detailed, and artistic prompt for an AI image generator (like Midjourney or DALL-E 3) to create a professional and marketable book cover. The prompt must explicitly include the book title, "{{{title}}}", as part of the image. The style should be modern and eye-catching for the {{{genre}}} genre.

2.  **Book Description:** Write a compelling, professional book description suitable for an online book seller like Amazon. It must have a strong opening hook to grab the reader's attention and be formatted with appropriate paragraph breaks.

3.  **Pricing Suggestion:** Recommend a retail price for both the eBook and the paperback versions. Provide a brief justification for your recommendation based on common pricing strategies for the {{{genre}}} genre and market standards.
  `,
});

const generateBookMarketingFlow = ai.defineFlow(
  {
    name: 'generateBookMarketingFlow',
    inputSchema: GenerateBookMarketingInputSchema,
    outputSchema: GenerateBookMarketingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
