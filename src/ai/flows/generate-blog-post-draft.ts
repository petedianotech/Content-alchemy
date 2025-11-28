'use server';

/**
 * @fileOverview Generates a blog post draft based on a topic and requirements.
 *
 * - generateBlogPostDraft - A function that generates a blog post draft.
 * - GenerateBlogPostDraftInput - The input type for the generateBlogPostDraft function.
 * - GenerateBlogPostDraftOutput - The return type for the generateBlogPostDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBlogPostDraftInputSchema = z.object({
  topic: z.string().describe('The topic of the blog post.'),
  requirements: z.string().describe('Specific requirements for the blog post (tone, keywords, target audience).'),
});
export type GenerateBlogPostDraftInput = z.infer<typeof GenerateBlogPostDraftInputSchema>;

const GenerateBlogPostDraftOutputSchema = z.object({
  draft: z.string().describe('The generated blog post draft.'),
});
export type GenerateBlogPostDraftOutput = z.infer<typeof GenerateBlogPostDraftOutputSchema>;

export async function generateBlogPostDraft(input: GenerateBlogPostDraftInput): Promise<GenerateBlogPostDraftOutput> {
  return generateBlogPostDraftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBlogPostDraftPrompt',
  input: {schema: GenerateBlogPostDraftInputSchema},
  output: {schema: GenerateBlogPostDraftOutputSchema},
  prompt: `You are an expert blog post writer who specializes in creating human-like, undetectable content that meets AdSense approval standards.

  Based on the following topic and requirements, generate a full blog post draft.

  Topic: {{{topic}}}
  Requirements: {{{requirements}}}

  Ensure the content is engaging, informative, and optimized for readability. The style should not be able to be detected as AI.
  `,
});

const generateBlogPostDraftFlow = ai.defineFlow(
  {
    name: 'generateBlogPostDraftFlow',
    inputSchema: GenerateBlogPostDraftInputSchema,
    outputSchema: GenerateBlogPostDraftOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
