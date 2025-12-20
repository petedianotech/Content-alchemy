
'use server';

/**
 * @fileOverview Generates a chat response based on a prompt.
 *
 * - generateChatResponse - A function that generates a chat response.
 * - GenerateChatResponseInput - The input type for the generateChatResponse function.
 * - GenerateChatResponseOutput - The return type for the generateChatResponse function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const GenerateChatResponseInputSchema = z.object({
  prompt: z.string().describe("The user's message."),
});
export type GenerateChatResponseInput = z.infer<
  typeof GenerateChatResponseInputSchema
>;

const GenerateChatResponseOutputSchema = z.object({
  response: z.string().describe('The AI-generated chat response.'),
});
export type GenerateChatResponseOutput = z.infer<
  typeof GenerateChatResponseOutputSchema
>;

export async function generateChatResponse(
  input: GenerateChatResponseInput
): Promise<GenerateChatResponseOutput> {
  return generateChatResponseFlow(input);
}

const generateChatResponseFlow = ai.defineFlow(
  {
    name: 'generateChatResponseFlow',
    inputSchema: GenerateChatResponseInputSchema,
    outputSchema: GenerateChatResponseOutputSchema,
  },
  async ({prompt}) => {
    const {output} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      system:
        'You are PeteAi, a friendly and helpful AI assistant. Your goal is to assist users with their content creation and automation needs. Be concise, knowledgeable, and always encouraging.',
      prompt: prompt,
    });
    
    return {response: output?.text ?? ''};
  }
);
