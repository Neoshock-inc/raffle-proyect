import React from 'react'
import { cn } from './cn'

interface CardProps {
    children: React.ReactNode
    className?: string
}

export function Card({ children, className }: CardProps) {
    return (
        <div
            className={cn(
                'bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50',
                className
            )}
        >
            {children}
        </div>
    )
}

interface CardHeaderProps {
    children: React.ReactNode
    className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div
            className={cn(
                'px-6 pt-6 pb-2',
                className
            )}
        >
            {children}
        </div>
    )
}

interface CardBodyProps {
    children: React.ReactNode
    className?: string
}

export function CardBody({ children, className }: CardBodyProps) {
    return (
        <div className={cn('p-6', className)}>
            {children}
        </div>
    )
}
