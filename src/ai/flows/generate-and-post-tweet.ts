'use server';

/**
 * @fileOverview A unified flow that generates a tweet and posts it to X.
 *
 * - generateAndPostTweet - A function that handles the entire process from topic to post.
 * - GenerateAndPostTweetInput - The input type for the function.
 * - GenerateAndPostTweetOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {generateTweet, type GenerateTweetInput} from './generate-tweet';
import {postTweet} from './post-tweet';


const GenerateAndPostTweetOutputSchema = z.object({
  success: z.boolean().describe('Whether the entire process was successful.'),
  generatedTweet: z.string().describe('The content of the generated tweet.'),
  tweetId: z.string().optional().describe('The ID of the posted tweet.'),
  error: z.string().optional().describe('Error message if any step failed.'),
});
export type GenerateAndPostTweetOutput = z.infer<
  typeof GenerateAndPostTweetOutputSchema
>;

export async function generateAndPostTweet(
  input: GenerateTweetInput
): Promise<GenerateAndPostTweetOutput> {
  return generateAndPostTweetFlow(input);
}

const generateAndPostTweetFlow = ai.defineFlow(
  {
    name: 'generateAndPostTweetFlow',
    inputSchema: z.custom<GenerateTweetInput>(),
    outputSchema: GenerateAndPostTweetOutputSchema,
  },
  async input => {
    // Step 1: Generate the tweet
    const generationResult = await generateTweet(input);
    if (!generationResult || !generationResult.tweet) {
      return {
        success: false,
        generatedTweet: '',
        error: 'Failed to generate tweet content.',
      };
    }

    // Step 2: Post the generated tweet
    const postResult = await postTweet({tweet: generationResult.tweet});
    if (!postResult.success) {
      return {
        success: false,
        generatedTweet: generationResult.tweet,
        error: postResult.error || 'Failed to post the generated tweet.',
      };
    }

    return {
      success: true,
      generatedTweet: generationResult.tweet,
      tweetId: postResult.tweetId,
    };
  }
);
