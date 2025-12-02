'use server';
/**
 * @fileOverview A Genkit flow that provides a high-level executive summary based on analytics data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the schema for the analytics data input
const AnalyticsDataSchema = z.object({
  totalBookings: z.number().describe('Total number of bookings in the last month.'),
  totalRevenue: z.number().describe('Total revenue in USD in the last month.'),
  peakBookingDay: z.string().describe('The day of the week with the most bookings.'),
  mostPopularMuseum: z.string().describe('The name of the museum with the most bookings.'),
  totalVisitors: z.number().describe('Total number of visitors in the last month.'),
  cancellationRate: z.number().describe('The percentage of bookings that were canceled.'),
});

// Define the input schema for the flow
const GetAnalyticsSummaryInputSchema = z.object({
  mockAnalyticsData: AnalyticsDataSchema,
});
export type GetAnalyticsSummaryInput = z.infer<typeof GetAnalyticsSummaryInputSchema>;


// Define the output schema for the flow
const AnalyticsSummarySchema = z.object({
  executiveSummary: z.string().describe("A 4-8 sentence natural-language summary of the most important insights from the data."),
  keyProblem: z.string().describe("A concise sentence identifying the single biggest problem or weakness revealed by the data."),
  topOpportunity: z.string().describe("A concise sentence identifying the single biggest opportunity for growth or improvement."),
});

export type AnalyticsSummary = z.infer<typeof AnalyticsSummarySchema>;


// Export the main function to be called from the server action
export async function getAnalyticsSummary(input: GetAnalyticsSummaryInput): Promise<AnalyticsSummary> {
  return getAnalyticsSummaryFlow(input);
}


// The Genkit Flow
const getAnalyticsSummaryFlow = ai.defineFlow(
  {
    name: 'getAnalyticsSummaryFlow',
    inputSchema: GetAnalyticsSummaryInputSchema,
    outputSchema: AnalyticsSummarySchema,
  },
  async (input) => {

    const llmResponse = await ai.generate({
      prompt: `You are a top-tier business strategist and data scientist for a museum ticketing platform. Your task is to provide a high-level executive summary for museum management.

      Analyze the following analytics data and distill it into a concise, actionable report. Focus on the big picture.

      Analytics Data:
      - Total Bookings (last month): ${input.mockAnalyticsData.totalBookings}
      - Total Revenue (last month): $${input.mockAnalyticsData.totalRevenue.toLocaleString()}
      - Total Visitors (last month): ${input.mockAnalyticsData.totalVisitors.toLocaleString()}
      - Peak Booking Day: ${input.mockAnalyticsData.peakBookingDay}
      - Most Popular Museum: "${input.mockAnalyticsData.mostPopularMuseum}"
      - Cancellation Rate: ${input.mockAnalyticsData.cancellationRate}%

      Based on this data, generate an executive summary, identify the single most critical problem, and the single most promising opportunity. Be direct and insightful.
      `,
      output: {
        schema: AnalyticsSummarySchema,
      },
    });

    const output = llmResponse.output();
    if (output) {
      return output;
    }

    // Fallback in case of an error or no output
    return {
        executiveSummary: "Could not generate a summary at this time. The AI model may be offline or experiencing issues.",
        keyProblem: "Analysis could not be completed.",
        topOpportunity: "Analysis could not be completed."
    };
  }
);
