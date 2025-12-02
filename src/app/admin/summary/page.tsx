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
import { Loader2, Sparkles, AlertTriangle, CheckCircle, BarChart, TrendingUp, Users, Ticket } from 'lucide-react';
import { getAnalyticsSummary } from '@/ai/flows/get-analytics-summary';
import type { AnalyticsSummary } from '@/ai/flows/get-analytics-summary';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import BookingsOverTimeChart from '@/components/charts/bookings-over-time-chart';
import { Badge } from '@/components/ui/badge';


export default function SummaryPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);
    try {
      // Get the start and end of the current month
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const result = await getAnalyticsSummary({
        time_range: { start: startDate, end: endDate },
      });
      setSummary(result);
    } catch (err: any) {
      console.error('Failed to get summary:', err);
      setError(err.message || 'An error occurred while generating the summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const SummaryStatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">AI Analytics Summary</h1>
        <p className="text-muted-foreground">
          Get a high-level executive report on your museum operations for the current month.
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
          {error && <p className="text-destructive mt-4">{error}</p>}
        </CardContent>
      </Card>

      {summary && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Executive Report</CardTitle>
              <CardDescription>Generated on {new Date(summary.meta.generated_at).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                  <h3 className="font-semibold text-lg mb-2">Key Insights Summary</h3>
                  <p className="text-muted-foreground leading-relaxed">
                  {summary.executive_summary}
                  </p>
              </div>
              
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>#1 Key Problem</AlertTitle>
                      <AlertDescription>
                          {summary.key_problem}
                      </AlertDescription>
                  </Alert>
                  <Alert variant="default" className="border-green-500 text-green-700 dark:border-green-700 dark:text-green-400 [&>svg]:text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>#1 Top Opportunity</AlertTitle>
                      <AlertDescription>
                          {summary.top_opportunity}
                      </AlertDescription>
                  </Alert>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <SummaryStatCard title="Total Visitors" value={summary.summary.total_visitors.toLocaleString()} icon={Users} />
             <SummaryStatCard title="Total Revenue" value={`$${summary.summary.total_revenue.toLocaleString()}`} icon={TrendingUp} />
             <SummaryStatCard title="Peak Day" value={summary.summary.peak_day.split('-')[2]} icon={Calendar} />
             <SummaryStatCard title="Avg. Revenue / Visitor" value={`$${summary.summary.avg_revenue_per_visitor.toFixed(2)}`} icon={BarChart} />
          </div>

          <Card>
              <CardHeader>
                <CardTitle>Daily Visitors</CardTitle>
                <CardDescription>Visitor trend for the month of {new Date(summary.meta.period_start).toLocaleString('default', { month: 'long' })}.</CardDescription>
              </CardHeader>
              <CardContent>
                <BookingsOverTimeChart data={summary.time_series.daily_visitors.map(d => ({ date: d.date, Bookings: d.visitors }))} />
              </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Top 5 Actionable Recommendations</CardTitle>
                <CardDescription>AI-generated suggestions to improve operations and revenue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {summary.recommendations.map(rec => (
                    <div key={rec.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                            <h4 className="font-semibold">{rec.title}</h4>
                             <Badge variant={rec.expected_impact === 'high' ? 'default' : 'secondary'}>{rec.expected_impact}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                        <p className="text-xs text-muted-foreground mt-2">Confidence: {(rec.confidence * 100).toFixed(0)}%</p>
                    </div>
                ))}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
