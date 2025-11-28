'use server';

/**
 * @fileOverview Generates a YouTube script based on a topic and requirements.
 *
 * - generateYoutubeScript - A function that generates a YouTube script.
 * - GenerateYoutubeScriptInput - The input type for the generateYoutubeScript function.
 * - GenerateYoutubeScriptOutput - The return type for the generateYoutubeScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateYoutubeScriptInputSchema = z.object({
  topic: z.string().describe('The topic of the YouTube video.'),
  requirements: z.string().describe('Specific requirements for the YouTube script (tone, length, structure, target audience).'),
});
export type GenerateYoutubeScriptInput = z.infer<typeof GenerateYoutubeScriptInputSchema>;

const GenerateYoutubeScriptOutputSchema = z.object({
  script: z.string().describe('The generated YouTube script.'),
});
export type GenerateYoutubeScriptOutput = z.infer<typeof GenerateYoutubeScriptOutputSchema>;

export async function generateYoutubeScript(input: GenerateYoutubeScriptInput): Promise<GenerateYoutubeScriptOutput> {
  return generateYoutubeScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateYoutubeScriptPrompt',
  input: {schema: GenerateYoutubeScriptInputSchema},
  output: {schema: GenerateYoutubeScriptOutputSchema},
  prompt: `You are an expert YouTube scriptwriter.

  Based on the following topic and requirements, generate a full video script. The script should be engaging and optimized for viewer retention.

  Topic: {{{topic}}}
  Requirements: {{{requirements}}}

  The script should include sections for an introduction/hook, main content, and an outro with a call to action.
  `,
});

const generateYoutubeScriptFlow = ai.defineFlow(
  {
    name: 'generateYoutubeScriptFlow',
    inputSchema: GenerateYoutubeScriptInputSchema,
    outputSchema: GenerateYoutubeScriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
