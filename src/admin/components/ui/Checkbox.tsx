import React from 'react'
import { cn } from './cn'

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string
    description?: string
}

export function Checkbox({
    label,
    description,
    className,
    id,
    ...props
}: CheckboxProps) {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
        <div className="flex items-start">
            <input
                type="checkbox"
                id={checkboxId}
                className={cn(
                    'h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded',
                    'dark:border-gray-600 dark:bg-gray-800',
                    className
                )}
                {...props}
            />
            {(label || description) && (
                <div className="ml-2">
                    {label && (
                        <label htmlFor={checkboxId} className="block text-sm text-gray-900 dark:text-gray-200">
                            {label}
                        </label>
                    )}
                    {description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                    )}
                </div>
            )}
        </div>
    )
}
