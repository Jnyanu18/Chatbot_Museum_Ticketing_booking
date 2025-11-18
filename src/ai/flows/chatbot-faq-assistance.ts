'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing FAQ assistance to museum visitors via a chatbot.
 *
 * - chatbotFAQAssistance - A function that handles the chatbot FAQ assistance process.
 * - ChatbotFAQAssistanceInput - The input type for the chatbotFAQAssistance function.
 * - ChatbotFAQAssistanceOutput - The return type for the chatbotFAQAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatbotFAQAssistanceInputSchema = z.object({
  query: z.string().describe('The user query or question about the museum, exhibits, or services.'),
});
export type ChatbotFAQAssistanceInput = z.infer<typeof ChatbotFAQAssistanceInputSchema>;

const ChatbotFAQAssistanceOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query, providing relevant information about the museum, exhibits, or services.'),
});
export type ChatbotFAQAssistanceOutput = z.infer<typeof ChatbotFAQAssistanceOutputSchema>;

export async function chatbotFAQAssistance(input: ChatbotFAQAssistanceInput): Promise<ChatbotFAQAssistanceOutput> {
  return chatbotFAQAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotFAQAssistancePrompt',
  input: {schema: ChatbotFAQAssistanceInputSchema},
  output: {schema: ChatbotFAQAssistanceOutputSchema},
  prompt: `You are a helpful chatbot assisting museum visitors with their questions.  Provide concise and informative answers based on the following query:\n\nQuery: {{{query}}}`,
});

const chatbotFAQAssistanceFlow = ai.defineFlow(
  {
    name: 'chatbotFAQAssistanceFlow',
    inputSchema: ChatbotFAQAssistanceInputSchema,
    outputSchema: ChatbotFAQAssistanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
