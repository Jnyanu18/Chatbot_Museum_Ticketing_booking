'use client';

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

type ChartData = {
    name: string;
    revenue: number;
}[];

export default function RevenueByMuseumChart({ data }: { data: ChartData }) {
    const chartConfig = {
        revenue: {
            label: "Revenue",
            color: "hsl(var(--chart-1))",
        },
    };

    return (
        <div className="h-64 w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={data} accessibilityLayer margin={{ top: 5, right: 20, left: -10, bottom: 5, }}>
                    <XAxis
                        dataKey="name"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                    />
                    <YAxis 
                         tickFormatter={(value) => `$${value/1000}k`}
                    />
                     <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                     />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                </BarChart>
            </ChartContainer>
        </div>
    );
}
