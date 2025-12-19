'use server';

/**
 * @fileOverview Generates a chat response based on a prompt and conversation history.
 *
 * - generateChatResponse - A function that generates a chat response.
 * - GenerateChatResponseInput - The input type for the generateChatResponse function.
 * - GenerateChatResponseOutput - The return type for the generateChatResponse function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {Message, z} from 'genkit';

const GenerateChatResponseInputSchema = z.object({
  prompt: z.string().describe("The user's message."),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.array(z.object({text: z.string()})),
      })
    )
    .describe('The conversation history.'),
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
  async ({prompt, history}) => {
    const llmHistory = history.map(msg => {
      // The history from the client is in a slightly different format
      // We need to map `content` to `parts`.
      return new Message(msg.role, msg.content);
    });

    const {output} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      system:
        'You are PeteAi, a friendly and helpful AI assistant. Your goal is to assist users with their content creation and automation needs. Be concise, knowledgeable, and always encouraging.',
      prompt: prompt,
      history: llmHistory,
    });
    
    return {response: output?.text ?? ''};
  }
);
