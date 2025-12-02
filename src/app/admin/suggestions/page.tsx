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
import { Lightbulb, Loader2, Sparkles } from 'lucide-react';
import { getProjectSuggestions } from '@/ai/flows/get-project-suggestions';
import type { ProjectSuggestion } from '@/ai/flows/get-project-suggestions';

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const result = await getProjectSuggestions({
        // In the future, we can pass real-time analytics data here
        mockAnalyticsData: {
          totalBookings: 1578,
          totalRevenue: 78900,
          peakBookingDay: 'Saturday',
          mostPopularMuseum: 'The Metropolitan Museum of Art',
        },
      });
      setSuggestions(result.suggestions);
    } catch (err) {
      console.error('Failed to get suggestions:', err);
      setError('An error occurred while generating suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">AI-Powered Suggestions</h1>
        <p className="text-muted-foreground">
          Get AI-driven insights and recommendations to improve your museum's performance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Project Improvements</CardTitle>
          <CardDescription>
            Click the button below to analyze your project's data and receive
            customized suggestions from our AI assistant.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 text-center">
          <Button
            onClick={handleGenerateSuggestions}
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Analyzing Data...' : 'Generate Suggestions'}
          </Button>

          {error && <p className="text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold font-headline">Recommendations</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((suggestion, index) => (
                <Card key={index} className="flex flex-col">
                    <CardHeader className="flex-row items-start gap-4 space-y-0">
                        <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Lightbulb className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <CardTitle>{suggestion.title}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-muted-foreground">{suggestion.suggestion}</p>
                    </CardContent>
                </Card>
            ))}
            </div>
        </div>
      )}
    </div>
  );
}
