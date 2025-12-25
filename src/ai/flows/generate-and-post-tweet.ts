
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
import { initAdmin } from '@/firebase/server-init';
import { getAuth } from 'firebase-admin/auth';
import { serverTimestamp } from 'firebase/firestore';


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
  async (input, streamingCallback) => {
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
    if (!postResult.success || !postResult.tweetId) {
      return {
        success: false,
        generatedTweet: generationResult.tweet,
        error: postResult.error || 'Failed to post the generated tweet.',
      };
    }

    // Step 3: Save the tweet record to Firestore (only if a user ID is available)
    try {
        const userId = process.env.PRIMARY_USER_UID;
        if (!userId || userId === 'YOUR_FIREBASE_UID_HERE') {
            console.log("PRIMARY_USER_UID not set. Skipping save tweet to Firestore.");
        } else {
            const { firestore } = initAdmin();
            const tweetRecord = {
                userId: userId,
                tweetId: postResult.tweetId,
                content: generationResult.tweet,
                generationParams: input,
                metrics: { impressions: 0, likes: 0, retweets: 0, replies: 0 },
                creationDate: serverTimestamp(),
                metricsLastUpdated: null,
            };

            await firestore
                .collection('users')
                .doc(userId)
                .collection('tweets')
                .doc(postResult.tweetId)
                .set(tweetRecord);
            
            console.log(`Successfully saved tweet record ${postResult.tweetId} to Firestore.`);
        }

    } catch(e: any) {
        // Log the error, but don't fail the entire flow since the tweet was posted.
        // The user gets their tweet, but we know there's a problem with our tracking.
        console.error("Error saving tweet record to Firestore:", e);
    }


    return {
      success: true,
      generatedTweet: generationResult.tweet,
      tweetId: postResult.tweetId,
    };
  }
);

    