import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { ResolutionTimeCategory } from '../../types';

interface ResolutionBarChartProps {
  data: ResolutionTimeCategory[];
}

const COLORS = ['#F59E0B', '#10B981', '#22D3EE', '#818CF8'];

export const ResolutionBarChart: React.FC<ResolutionBarChartProps> = ({ data }) => {
  if (!data || !data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        No resolution metrics recorded yet
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.label,
    hours: d.avg_hours,
    count: d.resolved_count,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
          <XAxis type="number" stroke="#64748B" fontSize={11} unit="h" />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            width={120}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#101F33',
              borderColor: '#1E293B',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#F8FAFC',
            }}
            formatter={(value: any, name: any, item: any) => [
              `${value} hours avg (${item.payload.count} closed)`,
              'Avg Resolution Time',
            ]}
          />
          <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
