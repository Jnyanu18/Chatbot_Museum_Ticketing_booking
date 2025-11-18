'use client';

import { Line, LineChart, CartesianGrid, XAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

type ChartData = {
  date: string;
  expected: number;
  scanned: number;
}[];

export default function QrVerificationChart({ data }: { data: ChartData }) {
  const chartConfig = {
    expected: {
      label: 'Expected',
      color: 'hsl(var(--chart-3))',
    },
    scanned: {
      label: 'Scanned',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <div className="h-64 w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <LineChart
          data={data}
          accessibilityLayer
          margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            dataKey="expected"
            type="monotone"
            stroke="var(--color-expected)"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
          />
          <Line
            dataKey="scanned"
            type="monotone"
            stroke="var(--color-scanned)"
            strokeWidth={2}
            dot={true}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
