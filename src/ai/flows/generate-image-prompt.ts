'use server';

/**
 * @fileOverview Generates creative image prompts for text-to-image models.
 *
 * - generateImagePrompt - A function that generates image prompts.
 * - GenerateImagePromptInput - The input type for the generateImagePrompt function.
 * - GenerateImagePromptOutput - The return type for the generateImagePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImagePromptInputSchema = z.object({
  topic: z.string().describe('The basic idea or topic for the image.'),
  requirements: z.string().describe('Specific requirements for the prompt (e.g., style, artist, color palette, mood).'),
});
export type GenerateImagePromptInput = z.infer<typeof GenerateImagePromptInputSchema>;

const GenerateImagePromptOutputSchema = z.object({
  prompts: z.array(z.string()).describe('An array of 3 detailed and creative image prompts.'),
});
export type GenerateImagePromptOutput = z.infer<typeof GenerateImagePromptOutputSchema>;

export async function generateImagePrompt(input: GenerateImagePromptInput): Promise<GenerateImagePromptOutput> {
  return generateImagePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImagePromptPrompt',
  input: {schema: GenerateImagePromptInputSchema},
  output: {schema: GenerateImagePromptOutputSchema},
  prompt: `You are a world-class prompt engineer for text-to-image AI models like Midjourney, DALL-E, and Stable Diffusion.

Your task is to take a user's basic idea and transform it into 3 distinct, highly detailed, and creative prompts.

The prompts should include details about:
- Subject and composition
- Artistic style (e.g., photorealistic, impressionistic, cartoon, 3D render)
- Lighting (e.g., cinematic lighting, soft morning light, neon glow)
- Color palette
- Mood and atmosphere
- Technical specifications (e.g., 4k, 8k, detailed, unreal engine)

User Idea: {{{topic}}}
Specific Requirements: {{{requirements}}}

Generate 3 diverse and imaginative prompts based on the user's input.
  `,
});

const generateImagePromptFlow = ai.defineFlow(
  {
    name: 'generateImagePromptFlow',
    inputSchema: GenerateImagePromptInputSchema,
    outputSchema: GenerateImagePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
