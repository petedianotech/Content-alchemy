
'use server';

/**
 * @fileOverview A flow for generating and posting a scheduled Facebook post.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { generateFacebookPost, type GenerateFacebookPostInput } from './generate-facebook-post';
import { initAdmin } from '@/firebase/server-init';

// This is the user ID whose settings will be used for scheduled posts.
const SCHEDULED_POST_USER_ID = process.env.PRIMARY_USER_UID;

const ScheduledFacebookPostOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  postId: z.string().optional(),
});
export type ScheduledFacebookPostOutput = z.infer<typeof ScheduledFacebookPostOutputSchema>;

// Internal function to post to Facebook
async function postToFacebookPage(pageId: string, accessToken: string, message: string): Promise<string> {
    const url = `https://graph.facebook.com/${pageId}/feed`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: message,
            access_token: accessToken,
        }),
    });
    const data = await response.json();
    if (data.error) {
        throw new Error(`Facebook API error: ${data.error.message}`);
    }
    return data.id; // Returns the ID of the new post
}


export async function scheduledFacebookPostFlow(): Promise<ScheduledFacebookPostOutput> {
  return scheduledFacebookPostFlowInternal();
}

const scheduledFacebookPostFlowInternal = ai.defineFlow(
  {
    name: 'scheduledFacebookPostFlow',
    outputSchema: ScheduledFacebookPostOutputSchema,
  },
  async () => {
    if (!SCHEDULED_POST_USER_ID) {
      const errorMsg = 'PRIMARY_USER_UID environment variable is not set.';
      console.error(errorMsg);
      return { success: false, message: errorMsg };
    }
    
    const { firestore } = initAdmin();

    try {
        // 1. Fetch user's Facebook settings (Page ID, Access Token) from Firestore.
        const fbSettingsRef = firestore
            .collection('users')
            .doc(SCHEDULED_POST_USER_ID)
            .collection('facebookSettings')
            .doc('default');
        const fbSettingsSnap = await fbSettingsRef.get();

        if (!fbSettingsSnap.exists() || !fbSettingsSnap.data()?.accessToken) {
            return { success: false, message: "Facebook settings or access token not found for user." };
        }
        const { pageId, accessToken } = fbSettingsSnap.data()!;


        // 2. Fetch user's default post generation settings (topic, requirements).
        const blogSettingsRef = firestore
            .collection('users')
            .doc(SCHEDULED_POST_USER_ID)
            .collection('blogSettings')
            .doc('default');
        const blogSettingsSnap = await blogSettingsRef.get();
        
        let postInput: GenerateFacebookPostInput = {
            topic: "The amazing advancements in AI technology.",
            requirements: "Write an engaging and optimistic post about the future of AI. Include the hashtag #AI."
        };

        if (blogSettingsSnap.exists()) {
             const { topic, requirements } = blogSettingsSnap.data()!;
             postInput = { topic, requirements };
        }

        // 3. Generate the post content.
        const generatedPost = await generateFacebookPost(postInput);
        if (!generatedPost.post) {
            return { success: false, message: "Failed to generate Facebook post content." };
        }

        // 4. Use the Facebook Graph API to post the content to the specified page.
        const postId = await postToFacebookPage(pageId, accessToken, generatedPost.post);

        const successMsg = `Successfully posted to Facebook page ${pageId}. Post ID: ${postId}`;
        console.log(successMsg);
        return { success: true, message: successMsg, postId: postId };

    } catch (error: any) {
        console.error('Scheduled Facebook post flow failed:', error);
        return { success: false, message: error.message };
    }
  }
);
