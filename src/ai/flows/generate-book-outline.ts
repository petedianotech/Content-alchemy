'use server';

/**
 * @fileOverview Generates book titles and a professional chapter outline based on a user's idea.
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
  chapters: z.number().min(10).max(40).default(25).describe('The desired number of chapters.'),
  mood: z.string().describe('The desired mood of the book (e.g., Suspenseful, Humorous, Romantic).'),
});
export type GenerateBookOutlineInput = z.infer<typeof GenerateBookOutlineInputSchema>;

const ChapterSchema = z.object({
  title: z.string().describe("The title of the chapter or section (e.g., 'Prologue', 'Act I: The Setup', 'Chapter 1: The Call')."),
  description: z.string().describe("A detailed summary of what happens in this section or chapter, including plot points, character development, and setting details. This should be written in the third-person point of view."),
});

const GenerateBookOutlineOutputSchema = z.object({
  titles: z.array(z.string()).describe('An array of 3 potential book titles.'),
  outline: z.array(ChapterSchema).describe('An array of chapters and structural sections (Prologue, Acts, Epilogue) representing the professional book outline.'),
});
export type GenerateBookOutlineOutput = z.infer<typeof GenerateBookOutlineOutputSchema>;

export async function generateBookOutline(input: GenerateBookOutlineInput): Promise<GenerateBookOutlineOutput> {
  return generateBookOutlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBookOutlinePrompt',
  input: {schema: GenerateBookOutlineInputSchema},
  output: {schema: GenerateBookOutlineOutputSchema},
  prompt: `You are a world-class novelist and developmental editor who creates professional book outlines for publishing houses.

Your task is to take a user's book idea and generate 3 compelling titles and a detailed, professional outline structured for a full-length novel of approximately 300-400 pages.

The outline MUST be written from a third-person point of view.

The structure should be professional and comprehensive, including the following sections:
1.  **Prologue:** An introduction to the world or a key event.
2.  **Act I: The Setup:** Introduce the main characters, the world, and the inciting incident. This should cover roughly the first 25% of the chapters.
3.  **Act II: The Confrontation:** The main character confronts rising stakes and obstacles. This is the longest act and should cover about 50% of the chapters.
4.  **Act III: The Resolution:** The climax, falling action, and final resolution of the story. This should cover the final 25% of the chapters.
5.  **Epilogue:** A concluding section that wraps up loose ends or hints at a future story.

The total number of narrative chapters should be exactly {{{chapters}}}. The Acts should be used as structural headings, not as chapters themselves.

Each chapter in the outline must have a clear, evocative title and a detailed description of the key events, character development, plot points, and any important world-building details that occur.

User's Book Idea:
- Genre: {{{genre}}}
- Mood: {{{mood}}}
- Idea: {{{idea}}}

Generate 3 diverse and fitting titles for this book.
Then, generate the complete, professional outline with a Prologue, 3 Acts, {{{chapters}}} narrative chapters, and an Epilogue.
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
