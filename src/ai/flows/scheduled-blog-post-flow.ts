
'use server';

/**
 * @fileOverview A flow for generating and posting a scheduled blog post.
 * NOTE: This is a placeholder and does not yet post to a blog.
 */
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { generateBlogPostDraft, type GenerateBlogPostDraftInput } from './generate-blog-post-draft';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps } from 'firebase/app';

// Ensure Firebase is initialized
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const firestore = getFirestore();

// This is the user ID whose settings will be used for scheduled posts.
// IMPORTANT: Replace this with the actual Firebase UID of the primary user.
const SCHEDULED_POST_USER_ID = process.env.PRIMARY_USER_UID;

const ScheduledBlogPostOutputSchema = z.object({
  success: z.boolean(),
  draft: z.string().optional(),
  error: z.string().optional(),
});
export type ScheduledBlogPostOutput = z.infer<typeof ScheduledBlogPostOutputSchema>;


export async function scheduledBlogPostFlow(): Promise<ScheduledBlogPostOutput> {
  return scheduledBlogPostFlowInternal();
}

const scheduledBlogPostFlowInternal = ai.defineFlow(
  {
    name: 'scheduledBlogPostFlow',
    outputSchema: ScheduledBlogPostOutputSchema,
  },
  async () => {
    if (!SCHEDULED_POST_USER_ID) {
      const errorMsg =
        'PRIMARY_USER_UID environment variable is not set. Cannot run scheduled blog post flow.';
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Define a fallback input in case settings are not found in Firestore.
    let input: GenerateBlogPostDraftInput = {
      topic: 'The impact of AI on modern software development.',
      requirements: 'Write in a professional, informative tone. Target audience is software developers. Mention key concepts like machine learning, CI/CD, and code generation.',
    };

    try {
      const settingsDocRef = doc(
        firestore,
        'users',
        SCHEDULED_POST_USER_ID,
        'blogSettings',
        'default'
      );
      const docSnap = await getDoc(settingsDocRef);

      if (docSnap.exists()) {
        console.log('Found saved blog post settings, using them for generation.');
        const settingsData = docSnap.data();
        // Ensure topic and requirements are strings, providing fallbacks if they are missing
        input = {
          topic: settingsData.topic || input.topic,
          requirements: settingsData.requirements || input.requirements,
        };
      } else {
        console.log(
          'No saved blog settings found for user. Using default input.'
        );
      }
    } catch (error) {
      console.error(
        'Error fetching blog settings from Firestore, using default input:',
        error
      );
    }

    console.log('Running scheduled blog post flow with input:', input);
    try {
        const result = await generateBlogPostDraft(input);
        console.log('Scheduled blog post generated. Title:', result.draft.substring(0, 100).split('\n')[0]);
        // TODO: Add logic here to call the Blogger API using the user's OAuth token
        // Example: await postToBlogger(SCHEDULED_POST_USER_ID, result.draft);
        return { success: true, draft: result.draft };
    } catch (error: any) {
        console.error('Failed to generate blog draft:', error);
        return { success: false, error: error.message };
    }
  }
);
