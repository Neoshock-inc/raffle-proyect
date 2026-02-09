import React from 'react'

interface FormFieldProps {
    label?: string
    required?: boolean
    error?: string
    helperText?: string
    htmlFor?: string
    children: React.ReactNode
}

export function FormField({ label, required, error, helperText, htmlFor, children }: FormFieldProps) {
    return (
        <div>
            {label && (
                <label
                    htmlFor={htmlFor}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            {children}
            {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
            )}
        </div>
    )
}
