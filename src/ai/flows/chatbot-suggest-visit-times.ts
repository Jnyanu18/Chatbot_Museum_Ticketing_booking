'use server';

/**
 * @fileOverview This file defines a Genkit flow that suggests optimal museum visit times to users via a chatbot.
 *
 * The flow takes into account current and predicted crowd levels, as well as event schedules, to provide the best recommendations.
 *
 * @interface ChatbotSuggestVisitTimesInput - Input for the chatbotSuggestVisitTimes function.
 * @interface ChatbotSuggestVisitTimesOutput - Output for the chatbotSuggestVisitTimes function.
 * @function chatbotSuggestVisitTimes - Main function to get the optimal visit times based on museum details.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatbotSuggestVisitTimesInputSchema = z.object({
  museumId: z.string().describe('The ID of the museum for which to suggest visit times.'),
  date: z.string().describe('The date for which to suggest visit times (YYYY-MM-DD).'),
  currentHour: z.number().describe('The current hour of the day (0-23).'),
});

export type ChatbotSuggestVisitTimesInput = z.infer<typeof ChatbotSuggestVisitTimesInputSchema>;

const ChatbotSuggestVisitTimesOutputSchema = z.object({
  suggestedTimes: z.array(
    z.object({
      startTime: z.string().describe('Suggested start time for the visit (HH:mm).'),
      endTime: z.string().describe('Suggested end time for the visit (HH:mm).'),
      crowdLevel: z.string().describe('Predicted crowd level (Low, Medium, High).'),
      eventDetails: z.string().optional().describe('Details of any events happening during this time.'),
    })
  ).describe('Array of suggested visit times with crowd levels and event details.'),
});

export type ChatbotSuggestVisitTimesOutput = z.infer<typeof ChatbotSuggestVisitTimesOutputSchema>;

export async function chatbotSuggestVisitTimes(input: ChatbotSuggestVisitTimesInput): Promise<ChatbotSuggestVisitTimesOutput> {
  return chatbotSuggestVisitTimesFlow(input);
}

const suggestVisitTimesPrompt = ai.definePrompt({
  name: 'suggestVisitTimesPrompt',
  input: {schema: ChatbotSuggestVisitTimesInputSchema},
  output: {schema: ChatbotSuggestVisitTimesOutputSchema},
  prompt: `You are a museum visit planner AI. Your goal is to suggest the best times to visit the museum, taking into account crowd levels and event schedules.

  Museum ID: {{{museumId}}}
  Date: {{{date}}}
  Current Hour: {{{currentHour}}}

  Suggest optimal visit times, predicting crowd levels (Low, Medium, High) and including event details if any.
  Return the suggested times as array with startTime, endTime, crowdLevel, and optional eventDetails. The current time is {{{currentHour}}}.
  Consider that it is best to suggest a visit time at least one hour into the future to allow for travel.
`,
});

const chatbotSuggestVisitTimesFlow = ai.defineFlow(
  {
    name: 'chatbotSuggestVisitTimesFlow',
    inputSchema: ChatbotSuggestVisitTimesInputSchema,
    outputSchema: ChatbotSuggestVisitTimesOutputSchema,
  },
  async input => {
    const {output} = await suggestVisitTimesPrompt(input);
    return output!;
  }
);
