import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendDataPoint } from '../../types';

interface TrendsLineChartProps {
  data: TrendDataPoint[];
}

export const TrendsLineChart: React.FC<TrendsLineChartProps> = ({ data }) => {
  if (!data || !data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        No trend records available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#101F33',
              borderColor: '#1E293B',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#F8FAFC',
            }}
          />
          <Legend
            verticalAlign="top"
            height={30}
            formatter={(value) => <span className="text-xs text-slate-300 capitalize">{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="reported"
            stroke="#22D3EE"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorReported)"
            name="Reported Issues"
          />
          <Area
            type="monotone"
            dataKey="resolved"
            stroke="#10B981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorResolved)"
            name="Resolved Issues"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
