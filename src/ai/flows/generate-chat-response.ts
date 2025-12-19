'use server';

/**
 * @fileOverview Generates a chat response based on a prompt and conversation history.
 *
 * - generateChatResponse - A function that generates a chat response.
 * - GenerateChatResponseInput - The input type for the generateChatResponse function.
 * - GenerateChatResponseOutput - The return type for the generateChatResponse function.
 */

import {ai} from '@/ai/genkit';
import {z, Part, Message} from 'genkit';

const GenerateChatResponseInputSchema = z.object({
  prompt: z.string().describe("The user's message."),
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      parts: z.array(z.object({text: z.string()})),
    })
  ).describe('The conversation history.'),
});
export type GenerateChatResponseInput = z.infer<typeof GenerateChatResponseInputSchema>;


const GenerateChatResponseOutputSchema = z.object({
  response: z.string().describe('The AI-generated chat response.'),
});
export type GenerateChatResponseOutput = z.infer<typeof GenerateChatResponseOutputSchema>;

export async function generateChatResponse(input: GenerateChatResponseInput): Promise<GenerateChatResponseOutput> {
  return generateChatResponseFlow(input);
}

const generateChatResponseFlow = ai.defineFlow(
  {
    name: 'generateChatResponseFlow',
    inputSchema: GenerateChatResponseInputSchema,
    outputSchema: GenerateChatResponseOutputSchema,
  },
  async ({prompt, history}) => {
    
    const llmHistory: Message[] = history.map(msg => new Message(msg.role, msg.parts as Part[]));

    const {output} = await ai.generate({
      prompt: prompt,
      history: llmHistory,
    });
    return { response: output?.text || "" };
  }
);
