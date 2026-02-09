import { ReactNode } from 'react';

interface DashboardMetricCardProps {
    icon: ReactNode;
    title: string;
    value: ReactNode;
    subtitle?: string;
    iconBgColor?: string;
    iconColor?: string;
}

export default function DashboardMetricCard({
    icon,
    title,
    value,
    subtitle,
    iconBgColor = 'bg-indigo-50 dark:bg-indigo-900/30',
    iconColor = 'text-indigo-500',
}: DashboardMetricCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
            <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${iconBgColor}`}>
                <span className={iconColor}>{icon}</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-50">{value}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{title}</p>
            {subtitle && (
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
            )}
        </div>
    );
}
