
'use server';

/**
 * @fileOverview A flow for generating and posting a scheduled tweet on a predefined topic.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {generateAndPostTweet} from './generate-and-post-tweet';
import type {GenerateAndPostTweetOutput} from './generate-and-post-tweet';
import type {GenerateTweetInput} from './generate-tweet';
import { initAdmin } from '@/firebase/server-init';

// This is the user ID whose settings will be used for scheduled tweets.
const SCHEDULED_TWEET_USER_ID = process.env.PRIMARY_USER_UID;

export async function scheduledTweetFlow(): Promise<GenerateAndPostTweetOutput> {
  return scheduledTweetFlowInternal();
}

const scheduledTweetFlowInternal = ai.defineFlow(
  {
    name: 'scheduledTweetFlow',
    outputSchema: z.custom<GenerateAndPostTweetOutput>(),
  },
  async () => {
    if (!SCHEDULED_TWEET_USER_ID) {
      const errorMsg =
        'PRIMARY_USER_UID environment variable is not set. Cannot run scheduled tweet flow.';
      console.error(errorMsg);
      return {success: false, generatedTweet: '', error: errorMsg};
    }

    const { firestore } = initAdmin();

    // Define a fallback input in case settings are not found in Firestore.
    let input: GenerateTweetInput = {
      niche: "Tech & AI",
      topic:
        'An interesting and little-known fact about Artificial Intelligence.',
      style: 'Friendly',
      tone: 'Informative',
      viral: true,
      keywords: '#AI, #TechFact',
    };

    try {
      const settingsDocRef = firestore
        .collection('users')
        .doc(SCHEDULED_TWEET_USER_ID)
        .collection('tweetSettings')
        .doc('default');

      const docSnap = await settingsDocRef.get();

      if (docSnap.exists) {
        console.log('Found saved tweet settings, using them for generation.');
        // Type assertion to ensure the data matches GenerateTweetInput
        input = docSnap.data() as GenerateTweetInput;
      } else {
        console.log(
          'No saved tweet settings found for user. Using default input.'
        );
      }
    } catch (error) {
      console.error(
        'Error fetching tweet settings from Firestore, using default input:',
        error
      );
    }

    console.log('Running scheduled tweet flow with input:', input);
    const result = await generateAndPostTweet(input);
    console.log('Scheduled tweet flow result:', result);

    return result;
  }
);
