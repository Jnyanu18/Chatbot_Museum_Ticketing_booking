'use server';

/**
 * @fileOverview A Genkit flow that handles the intent recognition for booking tickets through the chatbot.
 *
 * - chatbotRecognizesBookingIntent - A function that processes user messages and identifies booking intents.
 * - ChatbotRecognizesBookingIntentInput - The input type for the chatbotRecognizesBookingIntent function.
 * - ChatbotRecognizesBookingIntentOutput - The return type for the chatbotRecognizesBookingIntent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { MUSEUMS } from '@/lib/data';

const ChatbotRecognizesBookingIntentInputSchema = z.object({
  message: z.string().describe('The user message to be processed by the chatbot.'),
  userId: z.string().describe('The ID of the user sending the message.'),
});
export type ChatbotRecognizesBookingIntentInput = z.infer<typeof ChatbotRecognizesBookingIntentInputSchema>;

const ChatbotRecognizesBookingIntentOutputSchema = z.object({
  intentRecognized: z.boolean().describe('Set to true ONLY if the user explicitly mentions wanting to "book", "buy", "get", or "reserve" a ticket. Otherwise, set to false.'),
});
export type ChatbotRecognizesBookingIntentOutput = z.infer<typeof ChatbotRecognizesBookingIntentOutputSchema>;

export async function chatbotRecognizesBookingIntent(input: ChatbotRecognizesBookingIntentInput): Promise<ChatbotRecognizesBookingIntentOutput> {
  return chatbotRecognizesBookingIntentFlow(input);
}

const chatbotRecognizesBookingIntentFlow = ai.defineFlow(
  {
    name: 'chatbotRecognizesBookingIntentFlow',
    inputSchema: ChatbotRecognizesBookingIntentInputSchema,
    outputSchema: ChatbotRecognizesBookingIntentOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.generate({
        prompt: `You are an intent recognition agent for a museum chatbot. Your only job is to determine if the user wants to book a ticket.
        
        Analyze the user's message.
        - If the message contains phrases like "I want to book a ticket", "buy tickets", "get a ticket", "reserve a spot", or similar explicit requests, you MUST set \`intentRecognized\` to true.
        - If the user is just asking a question (e.g., "What events are there?", "Are you open today?", "Tell me about the Louvre"), you MUST set \`intentRecognized\` to false.
        
        User Message: "${'\'\''}${input.message}${'\'\''}"
        `,
        output: {
            schema: ChatbotRecognizesBookingIntentOutputSchema,
        }
    });

    return llmResponse.output()!;
  }
);
