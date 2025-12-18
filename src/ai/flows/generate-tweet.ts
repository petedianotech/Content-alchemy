'use server';

/**
 * @fileOverview Generates a tweet based on a topic and requirements.
 *
 * - generateTweet - A function that generates a tweet.
 * - GenerateTweetInput - The input type for the generateTweet function.
 * - GenerateTweetOutput - The return type for the generateTweet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTweetInputSchema = z.object({
  topic: z.string().describe('The topic of the tweet.'),
  requirements: z.string().describe('Specific requirements for the tweet (tone, keywords, target audience).'),
});
export type GenerateTweetInput = z.infer<typeof GenerateTweetInputSchema>;

const GenerateTweetOutputSchema = z.object({
  tweet: z.string().describe('The generated tweet.'),
});
export type GenerateTweetOutput = z.infer<typeof GenerateTweetOutputSchema>;

export async function generateTweet(input: GenerateTweetInput): Promise<GenerateTweetOutput> {
  return generateTweetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTweetPrompt',
  input: {schema: GenerateTweetInputSchema},
  output: {schema: GenerateTweetOutputSchema},
  prompt: `You are an expert social media manager who specializes in writing viral tweets.

  Based on the following topic and requirements, generate a short, engaging tweet.

  Topic: {{{topic}}}
  Requirements: {{{requirements}}}

  Ensure the content is engaging, concise, and optimized for X (formerly Twitter). Include relevant hashtags. The style should be human-like and not detectable as AI.
  `,
});

const generateTweetFlow = ai.defineFlow(
  {
    name: 'generateTweetFlow',
    inputSchema: GenerateTweetInputSchema,
    outputSchema: GenerateTweetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
