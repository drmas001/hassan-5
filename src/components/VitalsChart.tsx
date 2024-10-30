import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Database } from '../types/supabase';

type Vitals = Database['public']['Tables']['vitals']['Row'];

interface VitalsChartProps {
  data: Vitals[];
  metric: 'heart_rate' | 'oxygen_saturation' | 'temperature';
  color: string;
  label: string;
  unit: string;
}

export function VitalsChart({ data, metric, color, label, unit }: VitalsChartProps) {
  const chartData = data.map(v => ({
    time: new Date(v.recorded_at).toLocaleTimeString(),
    value: v[metric],
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-2 border border-gray-200 shadow-sm rounded">
                    <p className="text-sm font-medium">{`${label}: ${payload[0].value} ${unit}`}</p>
                    <p className="text-xs text-gray-500">{payload[0].payload.time}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}