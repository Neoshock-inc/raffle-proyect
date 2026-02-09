import React from 'react'
import { cn } from './cn'
import { FormField } from './FormField'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
    icon?: React.ReactNode
}

export function Input({
    label,
    error,
    helperText,
    required,
    icon,
    className,
    id,
    ...props
}: InputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const input = (
        <div className={icon ? 'relative' : undefined}>
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    {icon}
                </div>
            )}
            <input
                id={inputId}
                required={required}
                className={cn(
                    'w-full px-3 py-2 border rounded-md shadow-sm text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                    'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400',
                    error
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300',
                    !!icon && 'pl-10',
                    className
                )}
                {...props}
            />
        </div>
    )

    if (!label && !error && !helperText) return input

    return (
        <FormField label={label} required={required} error={error} helperText={helperText} htmlFor={inputId}>
            {input}
        </FormField>
    )
}
