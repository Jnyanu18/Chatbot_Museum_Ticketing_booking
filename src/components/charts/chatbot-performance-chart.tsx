'use client';

import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

type ChartData = {
  intent: string;
  success: number;
  failed: number;
}[];

export default function ChatbotPerformanceChart({ data }: { data: ChartData }) {
  const chartConfig = {
    success: {
      label: 'Success',
      color: 'hsl(var(--chart-1))',
    },
    failed: {
      label: 'Failed',
      color: 'hsl(var(--chart-2))',
    },
  };

  return (
    <div className="h-64 w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart data={data} layout="vertical" accessibilityLayer margin={{left: 20}}>
            <XAxis type="number" hide />
            <YAxis
                dataKey="intent"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className="capitalize"
            />
            <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="success" stackId="a" fill="var(--color-success)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="failed" stackId="a" fill="var(--color-failed)" radius={[0, 4, 4, 0]}/>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
