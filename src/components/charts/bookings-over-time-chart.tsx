'use client';

import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

type ChartData = {
    date: string;
    Bookings: number;
}[];


export default function BookingsOverTimeChart({ data }: { data: ChartData }) {
  const chartConfig = {
    bookings: {
      label: 'Bookings',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <div className="h-64 w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
            data={data}
            margin={{
                top: 5,
                right: 20,
                left: -10,
                bottom: 5,
            }}
            >
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
             <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
             />
            <Area
                dataKey="Bookings"
                type="natural"
                fill="var(--color-bookings)"
                fillOpacity={0.4}
                stroke="var(--color-bookings)"
                stackId="a"
            />
            </AreaChart>
        </ChartContainer>
    </div>
  );
}
