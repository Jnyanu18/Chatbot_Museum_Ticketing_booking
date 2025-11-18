'use client';

import { Funnel, FunnelChart, LabelList, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
} from '@/components/ui/chart';

type ChartData = {
  step: string;
  count: number;
}[];

const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-1) / 0.8)',
    'hsl(var(--chart-1) / 0.6)',
    'hsl(var(--chart-1) / 0.4)',
    'hsl(var(--chart-1) / 0.2)',
];

export default function ConversionFunnelChart({ data }: { data: ChartData }) {
    const chartConfig = {
        count: {
            label: "Count",
        }
    };

    const funnelData = data.map((item, index) => ({
        ...item,
        fill: COLORS[index % COLORS.length],
    }));

  return (
    <div className="h-64 w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
                <Tooltip />
                <Funnel
                    dataKey="count"
                    data={funnelData}
                    isAnimationActive
                >
                    <LabelList position="right" fill="#000" stroke="none" dataKey="step" />
                    <LabelList position="center" fill="#fff" stroke="none" dataKey="count" />
                </Funnel>
            </FunnelChart>
        </ResponsiveContainer>
       </ChartContainer>
    </div>
  );
}
