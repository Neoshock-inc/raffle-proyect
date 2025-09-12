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
        const { data: paymentConfigs, error: paymentError } = await supabase
            .from('payment_configs')
            .select('*')
            .eq('tenant_id', tenantId)

        if (paymentError) {
            throw paymentError
        }

        // Intentar obtener cuentas bancarias de la nueva tabla (si existe)
        let bankAccountsFromNewTable: any[] = []
        try {
            const { data: bankAccountsData, error: bankError } = await supabase
                .from('bank_accounts')
                .select('*')
                .eq('tenant_id', tenantId)

            if (!bankError) {
                bankAccountsFromNewTable = bankAccountsData || []
            }
        } catch (error) {
            // Si la tabla no existe, continuar sin error
            console.log('bank_accounts table does not exist, using legacy payment_configs')
        }

        // Procesar configuraciones
        const config: any = {
            availableMethods: [],
            bankAccounts: [],
            bankInfo: null // Para retrocompatibilidad
        }

        // Arrays para recolectar cuentas bancarias del sistema legacy
        const legacyBankAccounts: any[] = []

        // Procesar configuraciones de pago
        paymentConfigs?.forEach(paymentConfig => {
            if (paymentConfig.provider === 'stripe') {
                config.stripe = paymentConfig
                config.availableMethods.push('stripe')
            } else if (paymentConfig.provider === 'paypal') {
                config.paypal = paymentConfig
                config.availableMethods.push('paypal')
            } else if (paymentConfig.provider === 'bank_account') {
                // Sistema legacy: múltiples cuentas bancarias en payment_configs
                legacyBankAccounts.push({
                    id: paymentConfig.id,
                    bank_name: paymentConfig.extra?.bank_name,
                    account_number: paymentConfig.extra?.account_number,
                    account_holder: paymentConfig.extra?.account_holder,
                    routing_number: paymentConfig.extra?.routing_number,
                    swift_code: paymentConfig.extra?.swift_code
                })
            }
        })

        // Determinar qué cuentas bancarias usar
        let finalBankAccounts: any[] = []

        if (bankAccountsFromNewTable.length > 0) {
            // Usar la nueva tabla si tiene datos
            finalBankAccounts = bankAccountsFromNewTable
        } else if (legacyBankAccounts.length > 0) {
            // Usar el sistema legacy si no hay datos en la nueva tabla
            finalBankAccounts = legacyBankAccounts
        }

        // Configurar cuentas bancarias finales
        if (finalBankAccounts.length > 0) {
            config.bankAccounts = finalBankAccounts
            config.availableMethods.push('transfer')

            // Para retrocompatibilidad, usar la primera cuenta bancaria como bankInfo
            config.bankInfo = {
                bank_name: finalBankAccounts[0].bank_name,
                account_number: finalBankAccounts[0].account_number,
                account_holder: finalBankAccounts[0].account_holder,
                routing_number: finalBankAccounts[0].routing_number,
                swift_code: finalBankAccounts[0].swift_code
            }
        }

        return NextResponse.json(config)
    } catch (error) {
        console.error('Error fetching tenant payment config:', error)
        return NextResponse.json(
            { error: 'Error al obtener configuración de pagos' },
            { status: 500 }
        )
    }
}