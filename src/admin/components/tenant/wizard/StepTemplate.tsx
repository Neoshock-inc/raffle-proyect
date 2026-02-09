'use client'

import { useState } from 'react'
import { LayoutSelector, LayoutPreview } from '@/admin/components/LayoutPreview'
import { useLayoutManager } from '@/admin/hooks/useLayoutManager'
import type { LayoutTemplate } from '@/admin/hooks/useLayoutManager'
import type { TenantWizardFormData } from '@/admin/hooks/useTenantWizard'
import type { PlanId } from '@/types/plans'

interface StepTemplateProps {
    formData: TenantWizardFormData
    setField: (field: string, value: string) => void
}

export default function StepTemplate({ formData, setField }: StepTemplateProps) {
    const [previewLayout, setPreviewLayout] = useState<LayoutTemplate | null>(null)

    const {
        allLayouts,
        previewMode,
        setPreviewDevice,
    } = useLayoutManager({
        currentLayout: formData.selectedTemplate,
        userPlan: formData.selectedPlan as PlanId,
        onLayoutChange: (layoutId) => setField('selectedTemplate', layoutId),
    })

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-5 text-center">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Elige la plantilla para tu tenant
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                    Podrás personalizarla después
                </p>
            </div>

            <LayoutSelector
                layouts={allLayouts}
                selectedLayout={formData.selectedTemplate}
                onLayoutSelect={(layoutId) => setField('selectedTemplate', layoutId)}
                onPreview={(layout) => setPreviewLayout(layout)}
                userPlan={formData.selectedPlan as PlanId}
            />

            {previewLayout && (
                <LayoutPreview
                    layout={previewLayout}
                    isOpen={!!previewLayout}
                    onClose={() => setPreviewLayout(null)}
                    device={previewMode}
                    onDeviceChange={setPreviewDevice}
                    tenantSlug={formData.slug || 'demo'}
                />
            )}
        </div>
    )
}
