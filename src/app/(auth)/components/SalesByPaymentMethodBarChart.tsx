'use client';

import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];

export default function SalesByPaymentMethodBarChart({ data }: {
    data: { payment_method: string, total: number }[]
}) {
    const processedData = data.map(d => ({
        payment_method: d.payment_method,
        total: Number(d.total) // <- Asegura que es número
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData}>
                <XAxis dataKey="payment_method" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#3b82f6">
                    {processedData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

