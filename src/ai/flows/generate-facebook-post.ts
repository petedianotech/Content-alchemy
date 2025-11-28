'use server';

/**
 * @fileOverview Generates a facebook post based on a topic and requirements.
 *
 * - generateFacebookPost - A function that generates a facebook post.
 * - GenerateFacebookPostInput - The input type for the generateFacebookPost function.
 * - GenerateFacebookPostOutput - The return type for the generateFacebookPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFacebookPostInputSchema = z.object({
  topic: z.string().describe('The topic of the facebook post.'),
  requirements: z.string().describe('Specific requirements for the facebook post (tone, keywords, target audience).'),
});
export type GenerateFacebookPostInput = z.infer<typeof GenerateFacebookPostInputSchema>;

const GenerateFacebookPostOutputSchema = z.object({
  post: z.string().describe('The generated facebook post.'),
});
export type GenerateFacebookPostOutput = z.infer<typeof GenerateFacebookPostOutputSchema>;

export async function generateFacebookPost(input: GenerateFacebookPostInput): Promise<GenerateFacebookPostOutput> {
  return generateFacebookPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFacebookPostPrompt',
  input: {schema: GenerateFacebookPostInputSchema},
  output: {schema: GenerateFacebookPostOutputSchema},
  prompt: `You are an expert social media manager who specializes in creating human-like, undetectable content that meets AdSense approval standards.

  Based on the following topic and requirements, generate a short, engaging Facebook post.

  Topic: {{{topic}}}
  Requirements: {{{requirements}}}

  Ensure the content is engaging, concise, and optimized for social media. The style should not be able to be detected as AI.
  `,
});

const generateFacebookPostFlow = ai.defineFlow(
  {
    name: 'generateFacebookPostFlow',
    inputSchema: GenerateFacebookPostInputSchema,
    outputSchema: GenerateFacebookPostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
