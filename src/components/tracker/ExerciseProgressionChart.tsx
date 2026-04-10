"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export interface ProgressionDataPoint {
  date: Date;
  dateStr: string;
  weight: number;
  reps: number;
}

interface ExerciseProgressionChartProps {
  data: ProgressionDataPoint[];
  exerciseName: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ProgressionDataPoint;
    return (
      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl text-sm transform">
        <p className="font-semibold mb-1 text-gray-300">{data.dateStr}</p>
        <p className="font-bold text-lg text-indigo-400">
          {data.weight} kg <span className="text-gray-400 text-sm font-normal">x {data.reps} reps</span>
        </p>
      </div>
    );
  }
  return null;
};

export function ExerciseProgressionChart({ data, exerciseName }: ExerciseProgressionChartProps) {
  const maxWeightRef = useMemo(() => {
    if (!data || data.length === 0) return null;
    return Math.max(...data.map(d => d.weight));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm">
        <p className="text-gray-400">Aucune donnée disponible pour tracer la courbe.</p>
      </div>
    );
  }

  // To make chart readable, we add some padding to Y axis
  const minWeight = Math.min(...data.map(d => d.weight));
  const maxWeight = maxWeightRef!;
  
  // Custom domains
  const yMin = Math.max(0, Math.floor(minWeight - 5));
  const yMax = Math.ceil(maxWeight + 5);

  return (
    <div className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Progression</h3>
        <p className="text-sm text-gray-500">Évolution de votre charge maximale sur la période ({exerciseName})</p>
      </div>
      
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 0,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="dateStr" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              domain={[yMin, yMax]} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }} />
            
            {/* PR Reference Line */}
            {maxWeightRef && (
              <ReferenceLine 
                y={maxWeightRef} 
                stroke="#fbbf24" // Amber 400
                strokeDasharray="4 4"
                label={{ 
                  position: 'insideTopRight',
                  value: `🏆 PR: ${maxWeightRef}kg`, 
                  fill: '#d97706', // Amber 600
                  fontSize: 12,
                  fontWeight: 'bold'
                }} 
              />
            )}

            <Line
              type="monotone"
              dataKey="weight"
              stroke="#4f46e5" /* Indigo 600 */
              strokeWidth={3}
              dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
