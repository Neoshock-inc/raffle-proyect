import React from 'react'
import { cn } from './cn'
import { FormField } from './FormField'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    error?: string
    helperText?: string
}

export function Textarea({
    label,
    error,
    helperText,
    required,
    className,
    id,
    ...props
}: TextareaProps) {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const textarea = (
        <textarea
            id={textareaId}
            required={required}
            className={cn(
                'w-full px-3 py-2 border rounded-md shadow-sm text-sm resize-vertical',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400',
                error
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300',
                className
            )}
            {...props}
        />
    )

    if (!label && !error && !helperText) return textarea

    return (
        <FormField label={label} required={required} error={error} helperText={helperText} htmlFor={textareaId}>
            {textarea}
        </FormField>
    )
}
