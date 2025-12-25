
'use server';

/**
 * @fileOverview A flow for generating a scheduled blog post.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { generateBlogPostDraft, type GenerateBlogPostDraftInput } from './generate-blog-post-draft';

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
    // Define a fallback input. This will be used for the scheduled blog post.
    // The automation will no longer fetch settings from Firestore to avoid build issues.
    const input: GenerateBlogPostDraftInput = {
      topic: 'The impact of AI on modern software development.',
      requirements: 'Write in a professional, informative tone. Target audience is software developers.',
    };
    
    console.log('Running scheduled blog post flow with static input:', input);
    try {
        const result = await generateBlogPostDraft(input);
        const successMsg = `Blog post draft generated successfully for topic: ${input.topic}`;
        console.log(successMsg);
        // The generated draft is available in result.draft
        // You could save it to Firestore, or integrate another service here in the future.
        return { success: true, message: successMsg, draft: result.draft };

    } catch (error: any) {
        console.error('Failed to generate blog draft:', error);
        return { success: false, message: error.message };
    }
  }
);
