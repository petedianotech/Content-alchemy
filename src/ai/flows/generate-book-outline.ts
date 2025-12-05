'use server';

/**
 * @fileOverview Generates book titles and a chapter outline based on a user's idea.
 *
 * - generateBookOutline - A function that generates book titles and a chapter outline.
 * - GenerateBookOutlineInput - The input type for the generateBookOutline function.
 * - GenerateBookOutlineOutput - The return type for the generateBookOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBookOutlineInputSchema = z.object({
  genre: z.string().describe('The genre of the book (e.g., Fantasy, Sci-Fi, Mystery).'),
  idea: z.string().describe('A brief description of the book idea or plot.'),
  chapters: z.number().min(5).max(50).default(25).describe('The desired number of chapters.'),
});
export type GenerateBookOutlineInput = z.infer<typeof GenerateBookOutlineInputSchema>;

const ChapterSchema = z.object({
  title: z.string().describe("The title of the chapter."),
  description: z.string().describe("A brief summary of what happens in this chapter."),
});

const GenerateBookOutlineOutputSchema = z.object({
  titles: z.array(z.string()).describe('An array of 3 potential book titles.'),
  outline: z.array(ChapterSchema).describe('An array of chapters with titles and descriptions, representing the book outline.'),
});
export type GenerateBookOutlineOutput = z.infer<typeof GenerateBookOutlineOutputSchema>;

export async function generateBookOutline(input: GenerateBookOutlineInput): Promise<GenerateBookOutlineOutput> {
  return generateBookOutlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBookOutlinePrompt',
  input: {schema: GenerateBookOutlineInputSchema},
  output: {schema: GenerateBookOutlineOutputSchema},
  prompt: `You are a world-class novelist and story outliner.

Your task is to take a user's book idea and generate 3 compelling titles and a detailed, chapter-by-chapter outline for a book with {{{chapters}}} chapters.

Each chapter in the outline should have a clear title and a short description of the key events, character development, or plot points that occur.

The outline should follow a logical narrative structure (e.g., exposition, rising action, climax, falling action, resolution).

User's Book Idea:
- Genre: {{{genre}}}
- Idea: {{{idea}}}

Generate 3 diverse and fitting titles for this book.
Then, generate a complete outline with exactly {{{chapters}}} chapters.
  `,
});

const generateBookOutlineFlow = ai.defineFlow(
  {
    name: 'generateBookOutlineFlow',
    inputSchema: GenerateBookOutlineInputSchema,
    outputSchema: GenerateBookOutlineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
