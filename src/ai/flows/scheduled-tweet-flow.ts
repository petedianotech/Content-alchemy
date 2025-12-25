
'use server';

/**
 * @fileOverview A flow for generating and posting a scheduled tweet on a predefined topic.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {generateAndPostTweet} from './generate-and-post-tweet';
import type {GenerateAndPostTweetOutput} from './generate-and-post-tweet';
import type {GenerateTweetInput} from './generate-tweet';

export async function scheduledTweetFlow(): Promise<GenerateAndPostTweetOutput> {
  return scheduledTweetFlowInternal();
}

const scheduledTweetFlowInternal = ai.defineFlow(
  {
    name: 'scheduledTweetFlow',
    outputSchema: z.custom<GenerateAndPostTweetOutput>(),
  },
  async () => {
    
    // Define a fallback input. This will be used for the scheduled tweet.
    // The automation will no longer fetch settings from Firestore to avoid build issues.
    const input: GenerateTweetInput = {
      niche: "Tech & AI",
      topic:
        'An interesting and little-known fact about Artificial Intelligence.',
      style: 'Friendly',
      tone: 'Informative',
      viral: true,
      keywords: '#AI, #TechFact',
    };

    console.log('Running scheduled tweet flow with static input:', input);
    const result = await generateAndPostTweet(input);
    console.log('Scheduled tweet flow result:', result);

    return result;
  }
);
