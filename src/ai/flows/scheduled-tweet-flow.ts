'use server';

/**
 * @fileOverview A flow for generating and posting a scheduled tweet on a predefined topic.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { generateAndPostTweet } from './generate-and-post-tweet';
import type { GenerateAndPostTweetOutput } from './generate-and-post-tweet';

export async function scheduledTweetFlow(): Promise<GenerateAndPostTweetOutput> {
  return scheduledTweetFlowInternal();
}

const scheduledTweetFlowInternal = ai.defineFlow(
  {
    name: 'scheduledTweetFlow',
    outputSchema: z.custom<GenerateAndPostTweetOutput>(),
  },
  async () => {
    // Define the topic and requirements for the automated tweet.
    // You can customize this to be anything you want.
    const input = {
      topic: 'An interesting and little-known fact about Artificial Intelligence.',
      requirements: 'The tone should be engaging, surprising, and educational. Include the hashtags #AI and #TechFact.',
    };

    console.log('Running scheduled tweet flow with input:', input);
    const result = await generateAndPostTweet(input);
    console.log('Scheduled tweet flow result:', result);
    
    return result;
  }
);
