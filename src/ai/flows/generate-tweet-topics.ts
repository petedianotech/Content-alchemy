'use server';

/**
 * @fileOverview Generates a list of top-performing tweet topics for a given niche.
 *
 * - generateTweetTopics - A function that generates tweet topics.
 * - GenerateTweetTopicsInput - The input type for the generateTweetTopics function.
 * - GenerateTweetTopicsOutput - The return type for the generateTweetTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTweetTopicsInputSchema = z.object({
  niche: z.string().describe('The general category or niche to generate topics for.'),
});
export type GenerateTweetTopicsInput = z.infer<typeof GenerateTweetTopicsInputSchema>;

const GenerateTweetTopicsOutputSchema = z.object({
  topics: z.array(z.string()).describe('A ranked array of 5-7 top-performing, specific tweet topics for the given niche.'),
});
export type GenerateTweetTopicsOutput = z.infer<typeof GenerateTweetTopicsOutputSchema>;

export async function generateTweetTopics(
  input: GenerateTweetTopicsInput
): Promise<GenerateTweetTopicsOutput> {
  return generateTweetTopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTweetTopicsPrompt',
  input: {schema: GenerateTweetTopicsInputSchema},
  output: {schema: GenerateTweetTopicsOutputSchema},
  prompt: `You are an expert social media strategist specializing in X (formerly Twitter). Your task is to brainstorm viral tweet topics.

Based on the following niche, generate a ranked list of 5-7 specific, engaging, and high-performing tweet topics. These topics should be specific enough to be the basis of a single tweet.

Niche: {{{niche}}}

The topics should be things that are likely to get engagement (likes, replies, retweets). Focus on current trends, common questions, controversial opinions, and actionable advice within that niche.
  `,
});

const generateTweetTopicsFlow = ai.defineFlow(
  {
    name: 'generateTweetTopicsFlow',
    inputSchema: GenerateTweetTopicsInputSchema,
    outputSchema: GenerateTweetTopicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
