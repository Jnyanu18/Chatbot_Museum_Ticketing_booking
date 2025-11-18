// chatbot-recognizes-booking-intent.ts
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

const ChatbotRecognizesBookingIntentInputSchema = z.object({
  message: z.string().describe('The user message to be processed by the chatbot.'),
  userId: z.string().describe('The ID of the user sending the message.'),
});
export type ChatbotRecognizesBookingIntentInput = z.infer<typeof ChatbotRecognizesBookingIntentInputSchema>;

const ChatbotRecognizesBookingIntentOutputSchema = z.object({
  intentRecognized: z.boolean().describe('Whether the chatbot recognized a booking intent.'),
  followUpMessage: z.string().optional().describe('A message to guide the user through the booking process if intent is recognized.'),
  suggestedMuseums: z.array(
    z.object({
      museumId: z.string(),
      museumName: z.string(),
    })
  ).optional().describe('Suggested museums based on user message.'),
});
export type ChatbotRecognizesBookingIntentOutput = z.infer<typeof ChatbotRecognizesBookingIntentOutputSchema>;

export async function chatbotRecognizesBookingIntent(input: ChatbotRecognizesBookingIntentInput): Promise<ChatbotRecognizesBookingIntentOutput> {
  return chatbotRecognizesBookingIntentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotRecognizesBookingIntentPrompt',
  input: {schema: ChatbotRecognizesBookingIntentInputSchema},
  output: {schema: ChatbotRecognizesBookingIntentOutputSchema},
  prompt: `You are a helpful chatbot assisting users in booking museum tickets.

  Analyze the user's message and determine if they are expressing an intent to book tickets.
  If a booking intent is detected, set intentRecognized to true and provide a followUpMessage to guide them through the booking process.
  The followUpMessage should ask the user which museum they would like to book tickets for and offer a few suggestions based on the content of their message if possible.
  If no booking intent is detected, set intentRecognized to false and leave followUpMessage blank.

  User Message: {{{message}}}
  User ID: {{{userId}}}
  \n  Output format:{
  intentRecognized: boolean,
  followUpMessage?: string,
  suggestedMuseums?: Array<{museumId: string, museumName: string}>
}`,
});

const chatbotRecognizesBookingIntentFlow = ai.defineFlow(
  {
    name: 'chatbotRecognizesBookingIntentFlow',
    inputSchema: ChatbotRecognizesBookingIntentInputSchema,
    outputSchema: ChatbotRecognizesBookingIntentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

