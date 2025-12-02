'use server';
/**
 * @fileOverview A Genkit flow that provides project improvement suggestions based on analytics data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the schema for the analytics data input
const AnalyticsDataSchema = z.object({
  totalBookings: z.number().describe('Total number of bookings in the last month.'),
  totalRevenue: z.number().describe('Total revenue in USD in the last month.'),
  peakBookingDay: z.string().describe('The day of the week with the most bookings.'),
  mostPopularMuseum: z.string().describe('The name of the museum with the most bookings.'),
});

// Define the schema for a single suggestion
export const ProjectSuggestionSchema = z.object({
    title: z.string().describe("A short, catchy title for the suggestion."),
    suggestion: z.string().describe("A detailed, actionable suggestion for improving the project based on the provided analytics. Each suggestion should be 1-2 sentences long."),
});

export type ProjectSuggestion = z.infer<typeof ProjectSuggestionSchema>;


// Define the input schema for the flow
const GetProjectSuggestionsInputSchema = z.object({
  mockAnalyticsData: AnalyticsDataSchema,
});
export type GetProjectSuggestionsInput = z.infer<typeof GetProjectSuggestionsInputSchema>;


// Define the output schema for the flow
const GetProjectSuggestionsOutputSchema = z.object({
  suggestions: z.array(ProjectSuggestionSchema).describe('A list of 3-5 actionable suggestions to improve the project.'),
});
export type GetProjectSuggestionsOutput = z.infer<typeof GetProjectSuggestionsOutputSchema>;


// Export the main function to be called from the server action
export async function getProjectSuggestions(input: GetProjectSuggestionsInput): Promise<GetProjectSuggestionsOutput> {
  return getProjectSuggestionsFlow(input);
}


// The Genkit Flow
const getProjectSuggestionsFlow = ai.defineFlow(
  {
    name: 'getProjectSuggestionsFlow',
    inputSchema: GetProjectSuggestionsInputSchema,
    outputSchema: GetProjectSuggestionsOutputSchema,
  },
  async (input) => {

    const llmResponse = await ai.generate({
      prompt: `You are an expert business analyst for a museum ticketing platform. Your goal is to provide actionable suggestions to increase revenue and user engagement based on the provided analytics data.

      Analyze the following data and generate 3-5 unique and creative suggestions. For each suggestion, provide a short title and a clear, concise description of the action to take.

      Analytics Data:
      - Total Bookings (last month): ${input.mockAnalyticsData.totalBookings}
      - Total Revenue (last month): $${input.mockAnalyticsData.totalRevenue}
      - Peak Booking Day: ${input.mockAnalyticsData.peakBookingDay}
      - Most Popular Museum: "${input.mockAnalyticsData.mostPopularMuseum}"

      Example Suggestion:
      - Title: "Weekend Flash Sale"
      - Suggestion: "Since ${input.mockAnalyticsData.peakBookingDay} is your busiest day, run a flash sale on Tuesday or Wednesday for the upcoming weekend to drive early-week traffic."
      `,
      output: {
        schema: GetProjectSuggestionsOutputSchema,
      },
    });

    const output = llmResponse.output();
    if (output) {
      return output;
    }

    // Fallback in case of an error or no output
    return {
        suggestions: [{
            title: "Error",
            suggestion: "Could not generate suggestions at this time. Please try again later."
        }]
    };
  }
);
