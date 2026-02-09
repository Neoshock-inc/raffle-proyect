'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 px-4 py-3">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{label}</p>
            {payload.map((entry: any, i: number) => (
                <p key={i} className="text-sm text-indigo-600 dark:text-indigo-400">
                    {entry.name}: <span className="font-semibold">{entry.value}</span>
                </p>
            ))}
        </div>
    );
}

export default function RecentEntriesColumnChart({ data }: { data: { hora: string; entradas: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} vertical={false} />
                <XAxis
                    dataKey="hora"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} />
                <Bar
                    dataKey="entradas"
                    fill="#6366f1"
                    name="Entradas"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
