'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 px-4 py-3">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{label}</p>
            {payload.map((entry: any, i: number) => (
                <p key={i} className="text-sm" style={{ color: entry.color }}>
                    {entry.name}: <span className="font-semibold">{entry.value}</span>
                </p>
            ))}
        </div>
    );
}

export default function SalesLineChart({ data }: { data: { date: string; ventas: number; facturas: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} vertical={false} />
                <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} />
                <Line
                    type="monotone"
                    dataKey="ventas"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#6366f1' }}
                    activeDot={{ r: 5 }}
                    name="Ventas ($)"
                />
                <Line
                    type="monotone"
                    dataKey="facturas"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#f97316' }}
                    activeDot={{ r: 5 }}
                    name="Facturas"
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
