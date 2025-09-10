// 📁 api/tenant-payment-config/[tenantId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    try {
        // Await the params since it's now a Promise
        const { tenantId } = await params

        // Obtener configuraciones de pago del tenant
        const { data: paymentConfigs, error } = await supabase
            .from('payment_configs')
            .select('*')
            .eq('tenant_id', tenantId)

        if (error) {
            throw error
        }

        // Procesar configuraciones
        const config: any = {
            availableMethods: [],
            bankInfo: null
        }

        paymentConfigs?.forEach(paymentConfig => {
            if (paymentConfig.provider === 'stripe') {
                config.stripe = paymentConfig
                config.availableMethods.push('stripe')
            } else if (paymentConfig.provider === 'paypal') {
                config.paypal = paymentConfig
                config.availableMethods.push('paypal')
            } else if (paymentConfig.provider === 'bank_account') {
                config.bank_account = paymentConfig
                config.availableMethods.push('transfer')
                config.bankInfo = paymentConfig.extra
            }
        })

        return NextResponse.json(config)
    } catch (error) {
        console.error('Error fetching tenant payment config:', error)
        return NextResponse.json(
            { error: 'Error al obtener configuración de pagos' },
            { status: 500 }
        )
    }
}