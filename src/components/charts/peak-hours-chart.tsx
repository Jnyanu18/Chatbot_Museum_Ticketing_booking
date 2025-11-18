'use client';

import { Bar, BarChart, CartesianGrid, XAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

type ChartData = {
  hour: string;
  visitors: number;
}[];

export default function PeakHoursChart({ data }: { data: ChartData }) {
  const chartConfig = {
    visitors: {
      label: 'Visitors',
      color: 'hsl(var(--chart-2))',
    },
  };

  return (
    <div className="h-64 w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart data={data} accessibilityLayer margin={{ top: 5, right: 20, left: -10, bottom: 5, }}>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="hour"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => `${value}:00`}
            />
            <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
                dataKey="visitors"
                fill="var(--color-visitors)"
                radius={4}
            />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
