import { Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/admin/components/ui/cn'

export interface WizardStep {
    label: string
    icon: LucideIcon
}

interface TenantWizardStepperProps {
    steps: WizardStep[]
    currentStep: number
    onStepClick?: (step: number) => void
}

export default function TenantWizardStepper({ steps, currentStep, onStepClick }: TenantWizardStepperProps) {
    return (
        <nav className="flex items-center justify-between">
            {steps.map((step, index) => {
                const isCompleted = index < currentStep
                const isCurrent = index === currentStep
                const isClickable = onStepClick && index < currentStep
                const Icon = step.icon

                return (
                    <div key={index} className="flex items-center flex-1 last:flex-none">
                        <button
                            type="button"
                            onClick={() => isClickable && onStepClick(index)}
                            disabled={!isClickable}
                            className={cn(
                                'flex items-center gap-2 group',
                                isClickable && 'cursor-pointer'
                            )}
                        >
                            <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors shrink-0',
                                isCompleted && 'bg-indigo-600 dark:bg-indigo-500 text-white',
                                isCurrent && 'bg-indigo-600 dark:bg-indigo-500 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/50',
                                !isCompleted && !isCurrent && 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            )}>
                                {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                            </div>
                            <span className={cn(
                                'text-sm font-medium hidden sm:inline whitespace-nowrap',
                                (isCompleted || isCurrent) ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                            )}>
                                {step.label}
                            </span>
                        </button>

                        {index < steps.length - 1 && (
                            <div className={cn(
                                'flex-1 h-0.5 mx-3',
                                index < currentStep
                                    ? 'bg-indigo-600 dark:bg-indigo-500'
                                    : 'bg-gray-200 dark:bg-gray-700'
                            )} />
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
