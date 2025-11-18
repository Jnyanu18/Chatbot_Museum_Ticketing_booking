'use client';

import { Bar, BarChart, CartesianGrid, XAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

type ChartData = {
  museum: string;
  count: number;
}[];

export default function AbandonedBookingsChart({ data }: { data: ChartData }) {
  const chartConfig = {
    count: {
      label: 'Abandoned Carts',
      color: 'hsl(var(--chart-5))',
    },
  };

  return (
    <div className="h-64 w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart
          data={data}
          accessibilityLayer
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="museum"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="count" fill="var(--color-count)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
