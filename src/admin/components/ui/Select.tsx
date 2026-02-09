import React from 'react'
import { cn } from './cn'
import { FormField } from './FormField'

interface SelectOption {
    value: string
    label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    options?: SelectOption[]
}

export function Select({
    label,
    error,
    required,
    options,
    children,
    className,
    id,
    ...props
}: SelectProps) {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const select = (
        <select
            id={selectId}
            required={required}
            className={cn(
                'w-full px-3 py-2 border rounded-md shadow-sm text-sm',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200',
                error
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300',
                className
            )}
            {...props}
        >
            {options
                ? options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))
                : children
            }
        </select>
    )

    if (!label && !error) return select

    return (
        <FormField label={label} required={required} error={error} htmlFor={selectId}>
            {select}
        </FormField>
    )
}
