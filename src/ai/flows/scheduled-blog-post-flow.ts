
'use server';

/**
 * @fileOverview A flow for generating a scheduled blog post.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { generateBlogPostDraft, type GenerateBlogPostDraftInput } from './generate-blog-post-draft';
import { initAdmin } from '@/firebase/server-init';

// This is the user ID whose settings will be used for scheduled posts.
const SCHEDULED_POST_USER_ID = process.env.PRIMARY_USER_UID;

const ScheduledBlogPostOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  draft: z.string().optional(),
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
      const errorMsg = 'PRIMARY_USER_UID environment variable is not set.';
      console.error(errorMsg);
      return { success: false, message: errorMsg };
    }
    
    const { firestore } = initAdmin();

    // Define a fallback input in case settings are not found in Firestore.
    let input: GenerateBlogPostDraftInput = {
      topic: 'The impact of AI on modern software development.',
      requirements: 'Write in a professional, informative tone. Target audience is software developers.',
    };

    try {
      const settingsDocRef = firestore
        .collection('users')
        .doc(SCHEDULED_POST_USER_ID)
        .collection('blogSettings')
        .doc('default');
      const docSnap = await settingsDocRef.get();

      if (docSnap.exists) {
        console.log('Found saved blog post settings, using them for generation.');
        const settingsData = docSnap.data();
        input = {
          topic: settingsData?.topic || input.topic,
          requirements: settingsData?.requirements || input.requirements,
        };
      } else {
        console.log('No saved blog settings found. Using default input.');
      }
    } catch (error) {
      console.error('Error fetching blog settings from Firestore:', error);
      // We can still proceed with the default input
    }

    console.log('Running scheduled blog post flow with input:', input);
    try {
        const result = await generateBlogPostDraft(input);
        const successMsg = `Blog post draft generated successfully for topic: ${input.topic}`;
        console.log(successMsg);
        // The generated draft is available in result.draft
        // You could save it to Firestore, or integrate another service here.
        return { success: true, message: successMsg, draft: result.draft };

    } catch (error: any) {
        console.error('Failed to generate blog draft:', error);
        return { success: false, message: error.message };
    }
  }
);
