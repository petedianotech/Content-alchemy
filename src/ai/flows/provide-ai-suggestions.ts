'use server';

/**
 * @fileOverview Provides AI suggestions for improving a blog post, including headline options, paragraph re-writes,
 * and featured image suggestions.
 *
 * - provideAiSuggestions - A function that generates AI suggestions for improving a blog post.
 * - ProvideAiSuggestionsInput - The input type for the provideAiSuggestions function.
 * - ProvideAiSuggestionsOutput - The return type for the provideAiSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideAiSuggestionsInputSchema = z.object({
  blogPostContent: z
    .string()
    .describe('The content of the blog post to improve.'),
});
export type ProvideAiSuggestionsInput = z.infer<typeof ProvideAiSuggestionsInputSchema>;

const ProvideAiSuggestionsOutputSchema = z.object({
  headlineSuggestions: z
    .array(z.string())
    .describe('AI-generated suggestions for the blog post headline.'),
  paragraphRewrites: z
    .array(z.string())
    .describe('AI-generated re-writes for paragraphs in the blog post.'),
  featuredImageSuggestions: z
    .string()
    .describe('AI-generated suggestions for a featured image for the blog post.'),
});
export type ProvideAiSuggestionsOutput = z.infer<typeof ProvideAiSuggestionsOutputSchema>;

export async function provideAiSuggestions(input: ProvideAiSuggestionsInput): Promise<ProvideAiSuggestionsOutput> {
  return provideAiSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAiSuggestionsPrompt',
  input: {schema: ProvideAiSuggestionsInputSchema},
  output: {schema: ProvideAiSuggestionsOutputSchema},
  prompt: `You are an AI assistant that provides suggestions for improving blog posts.

  Based on the provided blog post content, generate the following suggestions:

  - headlineSuggestions: Provide 3 alternative headlines for the blog post.
  - paragraphRewrites: Provide 2 re-written versions of paragraphs from the blog post to improve clarity and engagement.
  - featuredImageSuggestions: Suggest a featured image for the blog post that is relevant to the content and visually appealing.

  Blog Post Content: {{{blogPostContent}}}
  `,
});

const provideAiSuggestionsFlow = ai.defineFlow(
  {
    name: 'provideAiSuggestionsFlow',
    inputSchema: ProvideAiSuggestionsInputSchema,
    outputSchema: ProvideAiSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
