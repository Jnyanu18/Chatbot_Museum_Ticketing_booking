
'use server';
/**
 * @fileOverview A Genkit flow that provides a comprehensive monthly analysis and executive report for the admin team.
 * It operates as a combined museum business strategist and data scientist.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the detailed schemas as per the new requirements

const TimeRangeSchema = z.object({
  start: z.string().describe('The start date of the analysis period (YYYY-MM-DD).'),
  end: z.string().describe('The end date of the analysis period (YYYY-MM-DD).'),
});

const GetAnalyticsSummaryInputSchema = z.object({
  time_range: TimeRangeSchema,
  // These fields are included to match the full spec, though they are not used in this mock implementation.
  filters: z.object({ museum_ids: z.array(z.string()).optional() }).optional(),
  simulate: z.array(z.any()).optional(),
  forecast_horizon_days: z.number().optional().default(30),
});
export type GetAnalyticsSummaryInput = z.infer<typeof GetAnalyticsSummaryInputSchema>;


const MetaSchema = z.object({
  period_start: z.string(),
  period_end: z.string(),
  generated_at: z.string(),
  data_sources_present: z.array(z.string()),
});

const SummarySchema = z.object({
  total_visitors: z.number(),
  unique_visitors: z.number().nullable(),
  total_visits: z.number(),
  total_revenue: z.number(),
  avg_revenue_per_visitor: z.number(),
  top_museum: z.object({ id: z.string(), name: z.string(), visitors: z.number(), revenue: z.number() }),
  top_event: z.object({ id: z.string(), name: z.string(), tickets_sold: z.number(), capacity: z.number(), fill_rate: z.number(), avg_rating: z.number() }),
  peak_hour: z.string(),
  peak_day: z.string(),
  avg_rating: z.number(),
  cancellations_rate: z.number(),
});

const TimeSeriesSchema = z.object({
    daily_visitors: z.array(z.object({ date: z.string(), visitors: z.number() })),
    daily_revenue: z.array(z.object({ date: z.string(), revenue: z.number() })),
});

const RecommendationSchema = z.object({
    id: z.string(),
    type: z.enum(["staffing", "marketing", "pricing", "event", "cx", "infrastructure"]),
    title: z.string(),
    description: z.string(),
    reason: z.string(),
    expected_impact: z.enum(["low", "medium", "high"]),
    confidence: z.number().min(0).max(1),
});

const AnalyticsSummaryOutputSchema = z.object({
  meta: MetaSchema,
  summary: SummarySchema,
  time_series: TimeSeriesSchema,
  recommendations: z.array(RecommendationSchema).max(5),
  executive_summary: z.string().describe("A 3-6 sentence natural-language summary of the most important insights."),
  key_problem: z.string().describe("A concise sentence identifying the single biggest problem revealed by the data."),
  top_opportunity: z.string().describe("A concise sentence identifying the single biggest opportunity for growth or improvement."),
  data_issues: z.array(z.object({
    collection: z.string(),
    issue: z.string(),
    detail: z.string(),
  })),
});

export type AnalyticsSummary = z.infer<typeof AnalyticsSummaryOutputSchema>;


// Export the main function to be called from the server action
export async function getAnalyticsSummary(input: GetAnalyticsSummaryInput): Promise<AnalyticsSummary> {
  return getAnalyticsSummaryFlow(input);
}


// The Genkit Flow
const getAnalyticsSummaryFlow = ai.defineFlow(
  {
    name: 'getAnalyticsSummaryFlow',
    inputSchema: GetAnalyticsSummaryInputSchema,
    outputSchema: AnalyticsSummaryOutputSchema,
  },
  async (input) => {

    // In a real application, this is where you would query Firestore.
    // For this demonstration, we'll use mock data structured like the real output.
    const mockData = {
        totalBookings: 2145,
        totalRevenue: 107250,
        peakBookingDay: 'Saturday',
        mostPopularMuseum: 'The Metropolitan Museum of Art',
        totalVisitors: 3200,
        cancellationRate: 3.5,
    };

    const llmResponse = await ai.generate({
      prompt: `You are an AI Analytics & Operations Engine for a Museum Ticketing System.
      Your task is to produce a single, comprehensive monthly analysis and executive report.
      Act as a combined museum business strategist and data scientist.

      Analyze the following data for the period of ${input.time_range.start} to ${input.time_range.end}.
      
      Analytics Data:
      - Total Visitors: ${mockData.totalVisitors}
      - Total Bookings: ${mockData.totalBookings}
      - Total Revenue: $${mockData.totalRevenue.toLocaleString()}
      - Peak Booking Day: ${mockData.peakBookingDay}
      - Most Popular Museum: "${mockData.mostPopularMuseum}"
      - Cancellation Rate: ${mockData.cancellationRate}%
      
      Based on this data, generate a full analysis conforming to the output schema.
      Provide a strategic executive summary, identify the single most critical problem, the most promising opportunity,
      and generate 5 prioritized, actionable recommendations with impact and confidence scores.
      Simulate realistic time series data for daily visitors and revenue.
      The analysis should be insightful, deep, and strategic.
      `,
      output: {
        schema: AnalyticsSummaryOutputSchema,
      },
    });

    const output = llmResponse.output;
    if (output) {
      return output;
    }

    // Fallback in case of an error or no output
    throw new Error("Failed to generate analytics summary from the AI model.");
  }
);
