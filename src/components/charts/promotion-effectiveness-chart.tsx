'use client';

import { Bar, BarChart, CartesianGrid, XAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

type ChartData = {
  name: string;
  bookings: number;
}[];

export default function PromotionEffectivenessChart({ data }: { data: ChartData }) {
  const chartConfig = {
    bookings: {
      label: 'Bookings',
      color: 'hsl(var(--chart-1))',
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
            dataKey="name"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar
            dataKey="bookings"
            fill="var(--color-bookings)"
            radius={4}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
