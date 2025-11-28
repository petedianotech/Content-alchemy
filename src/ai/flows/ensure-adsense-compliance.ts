'use server';

/**
 * @fileOverview Ensures content compliance with AdSense guidelines.
 *
 * - ensureAdsenseCompliance - A function that ensures content is AdSense compliant.
 * - EnsureAdsenseComplianceInput - The input type for the ensureAdsenseCompliance function.
 * - EnsureAdsenseComplianceOutput - The return type for the ensureAdsenseCompliance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnsureAdsenseComplianceInputSchema = z.object({
  content: z
    .string()
    .describe('The blog post content to check for AdSense compliance.'),
});
export type EnsureAdsenseComplianceInput = z.infer<typeof EnsureAdsenseComplianceInputSchema>;

const EnsureAdsenseComplianceOutputSchema = z.object({
  isCompliant: z.boolean().describe('Whether the content is AdSense compliant.'),
  suggestions: z
    .string()
    .describe('Suggestions to make the content AdSense compliant.'),
});
export type EnsureAdsenseComplianceOutput = z.infer<typeof EnsureAdsenseComplianceOutputSchema>;

export async function ensureAdsenseCompliance(
  input: EnsureAdsenseComplianceInput
): Promise<EnsureAdsenseComplianceOutput> {
  return ensureAdsenseComplianceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ensureAdsenseCompliancePrompt',
  input: {schema: EnsureAdsenseComplianceInputSchema},
  output: {schema: EnsureAdsenseComplianceOutputSchema},
  prompt: `You are an expert in AdSense policies and guidelines. Review the following content and determine if it complies with AdSense guidelines. Provide suggestions to make it compliant.

Content:
{{{content}}}

Respond in JSON format:
{
  "isCompliant": true or false,
  "suggestions": "Suggestions to make the content AdSense compliant."
}`,
});

const ensureAdsenseComplianceFlow = ai.defineFlow(
  {
    name: 'ensureAdsenseComplianceFlow',
    inputSchema: EnsureAdsenseComplianceInputSchema,
    outputSchema: EnsureAdsenseComplianceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
