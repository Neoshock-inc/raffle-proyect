'use client';

import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#f97316', '#8b5cf6', '#06b6d4', '#10b981', '#f43f5e'];

function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const { payment_method, total } = payload[0].payload;
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 px-4 py-3">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{payment_method}</p>
            <p className="text-sm text-indigo-600 dark:text-indigo-400">
                Total: <span className="font-semibold">${Number(total).toFixed(2)}</span>
            </p>
        </div>
    );
}

export default function SalesByPaymentMethodBarChart({ data }: {
    data: { payment_method: string, total: number }[]
}) {
    const processedData = data.map(d => ({
        payment_method: d.payment_method,
        total: Number(d.total),
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData} layout="vertical" margin={{ left: 20 }}>
                <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis
                    type="category"
                    dataKey="payment_method"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    width={100}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} />
                <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={20}>
                    {processedData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
