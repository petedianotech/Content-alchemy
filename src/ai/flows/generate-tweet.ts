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
  niche: z.string().describe('The general category or niche of the tweet.'),
  topic: z
    .string()
    .describe(
      'The specific subject of the tweet, within the selected niche.'
    ),
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

export async function generateTweet(
  input: GenerateTweetInput
): Promise<GenerateTweetOutput> {
  return generateTweetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTweetPrompt',
  input: {schema: GenerateTweetInputSchema},
  output: {schema: GenerateTweetOutputSchema},
  prompt: `You are an expert social media manager who specializes in writing viral tweets for X (formerly Twitter). Your writing is indistinguishable from a human's. You NEVER sound like an AI. Your content is always original and uses simple, clear English.

Your task is to generate a short, engaging tweet based on the following criteria.

- Niche/Category: {{{niche}}}
- Specific Topic: {{{topic}}}
{{#if style}}- Writing Style: {{{style}}}{{/if}}
{{#if tone}}- Tone: {{{tone}}}{{/if}}
{{#if keywords}}- Keywords/Hashtags: {{{keywords}}}{{/if}}
{{#if viral}}- Optimization: Optimize for maximum virality and engagement. Use techniques like asking questions, stating a controversial opinion, or using a strong hook.{{/if}}

Ensure the content is concise and perfectly optimized for the X platform. Include relevant hashtags.
The final output must be 280 characters or less. The content MUST be original and written in a simple, human-like manner.
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
