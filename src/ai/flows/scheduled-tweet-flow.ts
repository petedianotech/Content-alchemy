'use server';

/**
 * @fileOverview A flow for generating and posting a scheduled tweet on a predefined topic.
 */
import {getFirestore, doc, getDoc} from 'firebase/firestore';
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {generateAndPostTweet} from './generate-and-post-tweet';
import type {GenerateAndPostTweetOutput} from './generate-and-post-tweet';
import {firebaseConfig} from '@/firebase/config';
import {initializeApp, getApps} from 'firebase/app';
import type {GenerateTweetInput} from './generate-tweet';

// Ensure Firebase is initialized
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const firestore = getFirestore();

// This is the user ID whose settings will be used for scheduled tweets.
// IMPORTANT: Replace this with the actual Firebase UID of the primary user.
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

    // Define a fallback input in case settings are not found in Firestore.
    let input: GenerateTweetInput = {
      topic:
        'An interesting and little-known fact about Artificial Intelligence.',
      style: 'Friendly',
      tone: 'Informative',
      viral: true,
      keywords: '#AI, #TechFact',
    };

    try {
      const settingsDocRef = doc(
        firestore,
        'users',
        SCHEDULED_TWEET_USER_ID,
        'tweetSettings',
        'default'
      );
      const docSnap = await getDoc(settingsDocRef);

      if (docSnap.exists()) {
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
