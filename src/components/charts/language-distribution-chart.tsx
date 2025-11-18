'use client';

import { Pie, PieChart, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

type ChartData = {
  name: string;
  value: number;
  fill: string;
}[];

export default function LanguageDistributionChart({ data }: { data: ChartData }) {
  const chartConfig = {
    visitors: {
      label: 'Visitors',
    },
    ...data.reduce((acc, cur) => ({ ...acc, [cur.name]: { label: cur.name } }), {}),
  };

  return (
    <div className="h-64 w-full">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-full"
      >
        <PieChart>
           <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
            />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            strokeWidth={5}
          />
           <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
