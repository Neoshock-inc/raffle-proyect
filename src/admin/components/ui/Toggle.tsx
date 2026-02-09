import React from 'react'
import { cn } from './cn'

interface ToggleProps {
    label?: string
    description?: string
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
}

export function Toggle({ label, description, checked, onChange, disabled = false }: ToggleProps) {
    return (
        <div className="flex items-center justify-between">
            {(label || description) && (
                <div className="flex-1 mr-3">
                    {label && (
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
                    )}
                    {description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                    )}
                </div>
            )}
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    checked
                        ? 'bg-indigo-600 dark:bg-indigo-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                )}
            >
                <span
                    className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        checked ? 'translate-x-5' : 'translate-x-0'
                    )}
                />
            </button>
        </div>
    )
}
