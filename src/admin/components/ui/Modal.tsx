'use client'

import React from 'react'
import { X } from 'lucide-react'
import { cn } from './cn'

const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
}

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    titleIcon?: React.ReactNode
    size?: keyof typeof sizeStyles
    children: React.ReactNode
    footer?: React.ReactNode
}

export function Modal({
    isOpen,
    onClose,
    title,
    titleIcon,
    size = 'md',
    children,
    footer,
}: ModalProps) {
    if (!isOpen) return null

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
        >
            <div
                className={cn(
                    'bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col',
                    sizeStyles[size]
                )}
            >
                {title && (
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            {titleIcon}
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {title}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}

                <div className="p-6 overflow-y-auto flex-1 min-h-0">
                    {children}
                </div>

                {footer && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 flex-shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}
