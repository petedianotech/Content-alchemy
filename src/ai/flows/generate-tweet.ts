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
  topic: z.string().describe('The niche or topic of the tweet.'),
  style: z
    .string()
    .optional()
    .describe('The desired writing style (e.g., Professional, Friendly, Humorous).'),
  tone: z
    .string()
    .optional()
    .describe('The desired tone of the tweet (e.g., Informative, Inspirational, Controversial).'),
  viral: z
    .boolean()
    .optional()
    .describe('Whether to optimize the tweet for virality.'),
  keywords: z
    .string()
    .optional()
    .describe('Specific keywords or hashtags to include.'),
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
  prompt: `You are an expert social media manager who specializes in writing viral tweets for X (formerly Twitter).

Your task is to generate a short, engaging tweet based on the following criteria.

- Niche/Topic: {{{topic}}}
{{#if style}}- Writing Style: {{{style}}}{{/if}}
{{#if tone}}- Tone: {{{tone}}}{{/if}}
{{#if keywords}}- Keywords/Hashtags: {{{keywords}}}{{/if}}
{{#if viral}}- Optimization: Optimize for maximum virality and engagement. Use techniques like asking questions, stating a controversial opinion, or using a strong hook.{{/if}}

Ensure the content is concise and optimized for the X platform. Include relevant hashtags. The style should be human-like and not detectable as AI.
The final output must be 280 characters or less.
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
