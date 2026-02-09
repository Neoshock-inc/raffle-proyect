'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Props {
    transferPercentage: number;
    stripePercentage: number;
}

const COLORS = ['#6366f1', '#f97316'];

export default function PaymentMethodGaugeMini({
    transferPercentage,
    stripePercentage,
}: Props) {
    const data = [
        { name: 'Transferencia', value: transferPercentage },
        { name: 'Pago en Línea', value: stripePercentage },
    ];

    const dominant = transferPercentage >= stripePercentage
        ? { label: 'Transferencia', pct: transferPercentage }
        : { label: 'Pago en Línea', pct: stripePercentage };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-full" style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius="65%"
                            outerRadius="90%"
                            dataKey="value"
                            stroke="none"
                            startAngle={90}
                            endAngle={-270}
                        >
                            {data.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                        {dominant.pct.toFixed(0)}%
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{dominant.label}</span>
                </div>
            </div>
            <div className="flex items-center gap-5 mt-2">
                {data.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                        <span
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: COLORS[index] }}
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                            {entry.name} ({entry.value.toFixed(1)}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
