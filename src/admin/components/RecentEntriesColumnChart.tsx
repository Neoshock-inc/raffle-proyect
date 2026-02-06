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

export default function RecentEntriesColumnChart({ data }: { data: { hora: string; entradas: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="entradas" fill="#10b981" name="Entradas" />
            </BarChart>
        </ResponsiveContainer>
    );
}
