import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { CategoryDistribution } from '../../types';

interface CategoryPieChartProps {
  data: CategoryDistribution[];
}

const COLORS = ['#F59E0B', '#10B981', '#22D3EE', '#818CF8'];

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const chartData = data.map((d) => ({
    name: d.label,
    value: d.count,
    open: d.open_count,
    resolved: d.resolved_count,
  }));

  if (!chartData.length) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        No category distribution data available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#101F33',
              borderColor: '#1E293B',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#F8FAFC',
            }}
            formatter={(value: any, name: any, item: any) => [
              `${value} reports (${item.payload.open} open, ${item.payload.resolved} resolved)`,
              name,
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
