'use server';

/**
 * @fileOverview Posts a tweet to X (formerly Twitter).
 *
 * - postTweet - A function that posts a tweet.
 * - PostTweetInput - The input type for the postTweet function.
 * - PostTweetOutput - The return type for the postTweet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {TwitterApi} from 'twitter-api-v2';

const PostTweetInputSchema = z.object({
  tweet: z.string().describe('The content of the tweet to post.'),
});
export type PostTweetInput = z.infer<typeof PostTweetInputSchema>;

const PostTweetOutputSchema = z.object({
  success: z.boolean().describe('Whether the tweet was posted successfully.'),
  tweetId: z.string().optional().describe('The ID of the posted tweet.'),
  error: z.string().optional().describe('Error message if posting failed.'),
});
export type PostTweetOutput = z.infer<typeof PostTweetOutputSchema>;

export async function postTweet(input: PostTweetInput): Promise<PostTweetOutput> {
  return postTweetFlow(input);
}

const postTweetFlow = ai.defineFlow(
  {
    name: 'postTweetFlow',
    inputSchema: PostTweetInputSchema,
    outputSchema: PostTweetOutputSchema,
  },
  async input => {
    const {tweet} = input;

    // Initialize Twitter/X client from environment variables
    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_KEY_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
    });

    const readWriteClient = twitterClient.readWrite;

    try {
      const result = await readWriteClient.v2.tweet(tweet);
      if (result.data) {
        return {
          success: true,
          tweetId: result.data.id,
        };
      } else {
        // Handle cases where the API might not return data but also not throw
        const error = result.errors?.[0]?.message || 'Unknown error from Twitter API';
        return {
          success: false,
          error: error,
        };
      }
    } catch (e: any) {
      console.error('Failed to post tweet:', e);
      return {
        success: false,
        error: e.message || 'An unexpected error occurred.',
      };
    }
  }
);
