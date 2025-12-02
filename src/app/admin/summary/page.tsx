'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { getAnalyticsSummary } from '@/ai/flows/get-analytics-summary';
import type { AnalyticsSummary } from '@/ai/flows/get-analytics-summary';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function SummaryPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);
    try {
      const result = await getAnalyticsSummary({
        // In a real application, this data would be fetched from Firestore.
        mockAnalyticsData: {
          totalBookings: 2145,
          totalRevenue: 107250,
          peakBookingDay: 'Saturday',
          mostPopularMuseum: 'The Metropolitan Museum of Art',
          totalVisitors: 3200,
          cancellationRate: 3.5,
        },
      });
      setSummary(result);
    } catch (err) {
      console.error('Failed to get summary:', err);
      setError('An error occurred while generating the summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">AI Analytics Summary</h1>
        <p className="text-muted-foreground">
          Get a high-level executive report on your museum operations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Executive Report</CardTitle>
          <CardDescription>
            Click the button to have the AI analyze your latest data and provide a strategic summary.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 text-center">
          <Button
            onClick={handleGenerateSummary}
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Generating Report...' : 'Generate AI Summary'}
          </Button>
          {error && <p className="text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Executive Report</CardTitle>
            <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <h3 className="font-semibold text-lg mb-2">Key Insights Summary</h3>
                <p className="text-muted-foreground leading-relaxed">
                {summary.executiveSummary}
                </p>
            </div>
            
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>#1 Key Problem</AlertTitle>
                    <AlertDescription>
                        {summary.keyProblem}
                    </AlertDescription>
                </Alert>
                <Alert variant="default" className="border-green-500 text-green-700 dark:border-green-700 dark:text-green-400 [&>svg]:text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>#1 Top Opportunity</AlertTitle>
                    <AlertDescription>
                        {summary.topOpportunity}
                    </AlertDescription>
                </Alert>
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  );
}
