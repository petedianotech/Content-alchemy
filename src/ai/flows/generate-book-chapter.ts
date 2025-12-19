
'use server';

/**
 * @fileOverview Generates the full text content for a single book chapter based on an outline.
 *
 * - generateBookChapter - A function that writes a chapter.
 * - GenerateBookChapterInput - The input type for the function.
 * - GenerateBookChapterOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBookChapterInputSchema = z.object({
  title: z.string().describe("The title of the chapter to be written."),
  description: z.string().describe("The detailed description of the chapter's plot points and character development from the outline."),
  genre: z.string().describe("The genre of the book."),
  mood: z.string().describe("The mood of the book."),
  previousChapterSummary: z.string().optional().describe("A brief summary of the previous chapter to ensure narrative continuity."),
  overallPlot: z.string().describe("A summary of the book's overall plot or idea."),
});
export type GenerateBookChapterInput = z.infer<typeof GenerateBookChapterInputSchema>;


const ImagePromptSchema = z.object({
    prompt: z.string().describe("A highly detailed DALL-E or Midjourney prompt to generate a visually stunning and relevant image for this part of the chapter."),
    location: z.string().describe("A short sentence from the chapter content where this image should be placed."),
});

const GenerateBookChapterOutputSchema = z.object({
  chapterContent: z.string().describe("The full text content of the chapter, written in a compelling, human-like, third-person narrative style."),
  imagePrompts: z.array(ImagePromptSchema).describe("An array of detailed image prompts for key scenes in the chapter."),
});
export type GenerateBookChapterOutput = z.infer<typeof GenerateBookChapterOutputSchema>;

export async function generateBookChapter(input: GenerateBookChapterInput): Promise<GenerateBookChapterOutput> {
  return generateBookChapterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBookChapterPrompt',
  input: {schema: GenerateBookChapterInputSchema},
  output: {schema: GenerateBookChapterOutputSchema},
  prompt: `You are a world-class ghostwriter for a major publishing house. Your task is to write a single, complete chapter for a novel.

The writing style must be engaging, human-like, and written from a **third-person point of view**.

You will also identify 1-2 key scenes or moments in the chapter that would be perfect for an illustration. For each of these moments, you will create a highly detailed and artistic prompt suitable for an AI image generator like DALL-E 3 or Midjourney.

Here is the context for the book and the chapter you need to write:
- Genre: {{{genre}}}
- Mood: {{{mood}}}
- Overall Book Idea: {{{overallPlot}}}
{{#if previousChapterSummary}}- Summary of Previous Chapter: {{{previousChapterSummary}}}{{/if}}

Chapter to Write:
- Title: {{{title}}}
- Outline Description: {{{description}}}

Write the full chapter content now. Ensure it follows the outline description, maintains the book's genre and mood, and flows logically from the previous chapter if a summary was provided.

After writing the chapter, provide detailed image prompts for key scenes.
  `,
});

const generateBookChapterFlow = ai.defineFlow(
  {
    name: 'generateBookChapterFlow',
    inputSchema: GenerateBookChapterInputSchema,
    outputSchema: GenerateBookChapterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    