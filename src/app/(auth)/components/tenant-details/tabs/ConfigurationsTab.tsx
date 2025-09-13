// 📁 components/tenant-details/tabs/ConfigurationsTab.tsx
import { useTenantConfigurations } from '@/app/(auth)/hooks/useTenantConfigurations'
import {
    CreditCard, Mail, DollarSign, Building2,
    Check, X, Settings, TestTube, Eye, EyeOff, Save, AlertCircle
} from 'lucide-react'
import { useState } from 'react'

interface ConfigurationsTabProps {
    tenantId: string
}

export function ConfigurationsTab({ tenantId }: ConfigurationsTabProps) {
    // Usar el hook que ya creamos
    // Usar el hook que ya creamos
    const {
        loading,
        saving,
        paymentForms,
        emailForm,
        bankAccounts, // NUEVO
        setPaymentForms,
        setEmailForm,
        updatePaymentConfig,
        updateEmailConfig,
        testConfiguration,
        // Nuevas funciones para cuentas bancarias
        addBankAccount,
        updateBankAccount,
        removeBankAccount,
        saveBankAccount
    } = useTenantConfigurations({ tenantId })

    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
    const [testResults, setTestResults] = useState<Record<string, any>>({})

    const toggleSecretVisibility = (key: string) => {
        setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handlePaymentConfigChange = (provider: keyof typeof paymentForms, field: string, value: any) => {
        setPaymentForms(prev => ({
            ...prev,
            [provider]: {
                ...prev[provider],
                [field]: value
            }
        }))
    }

    const handleEmailConfigChange = (provider: keyof typeof emailForm, field: string, value: any) => {
        setEmailForm(prev => ({
            ...prev,
            [provider]: {
                ...prev[provider],
                [field]: value
            }
        }))
    }

    // Nueva función para guardar la configuración - CON VALIDACIÓN
    const handleSaveEmailConfig = async () => {
        if (!emailForm.resend.api_key || !emailForm.resend.from_email) {
            // Mostrar error en el UI en lugar de console
            alert('Faltan la API key o el email remitente')
            return
        }

        const result = await updateEmailConfig(true)
        if (!result.success) {
            console.error('Error updating email config:', result.error)
            alert('Error al guardar: ' + result.error)
        }
    }

    const handleTest = async (type: 'payment' | 'email', provider: string) => {
        const result = await testConfiguration(type, provider)
        setTestResults(prev => ({
            ...prev,
            [`${type}_${provider}`]: result
        }))
    }

    // Handler para activar/desactivar configuraciones
    const handleTogglePaymentConfig = async (provider: 'stripe' | 'paypal', enabled: boolean) => {
        const result = await updatePaymentConfig(provider, enabled)
        if (!result.success) {
            // Mostrar error si es necesario
            console.error('Error updating payment config:', result.error)
        }
    }

    const handleToggleEmailConfig = async (enabled: boolean) => {
        // Solo cambiar el estado local del formulario
        setEmailForm(prev => ({
            ...prev,
            resend: { ...prev.resend, enabled }
        }))
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Cargando configuraciones...</span>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Configuraciones del Tenant
                </h3>
                <p className="text-sm text-gray-500">
                    Configura los métodos de pago y servicios de email para tu tenant
                </p>
            </div>

            {/* Configuraciones de Pago */}
            <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-base font-medium text-gray-900 flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Métodos de Pago
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                        Configura los proveedores de pago disponibles para tu tenant
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Stripe */}
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                    <CreditCard className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h5 className="font-medium text-gray-900">Stripe</h5>
                                    <p className="text-sm text-gray-500">Procesamiento de tarjetas de crédito</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {paymentForms.stripe.enabled && (
                                    <button
                                        onClick={() => handleTest('payment', 'stripe')}
                                        disabled={saving}
                                        className="p-2 text-blue-600 hover:text-blue-500 hover:bg-blue-50 rounded-md"
                                        title="Probar configuración"
                                    >
                                        <TestTube className="h-4 w-4" />
                                    </button>
                                )}
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={paymentForms.stripe.enabled}
                                        onChange={(e) => handleTogglePaymentConfig('stripe', e.target.checked)}
                                        disabled={saving}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>

                        {paymentForms.stripe.enabled && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Publishable Key *
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentForms.stripe.public_key}
                                        onChange={(e) => handlePaymentConfigChange('stripe', 'public_key', e.target.value)}
                                        placeholder="pk_test_..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Secret Key *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showSecrets.stripe_secret ? 'text' : 'password'}
                                            value={paymentForms.stripe.secret_key}
                                            onChange={(e) => handlePaymentConfigChange('stripe', 'secret_key', e.target.value)}
                                            placeholder="sk_test_..."
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleSecretVisibility('stripe_secret')}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                                        >
                                            {showSecrets.stripe_secret ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handleTogglePaymentConfig('stripe', true)}
                                        disabled={saving || !paymentForms.stripe.public_key || !paymentForms.stripe.secret_key}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        {saving ? 'Guardando...' : 'Guardar Stripe'}
                                    </button>
                                </div>
                                {testResults.payment_stripe && (
                                    <div className={`p-3 rounded-md text-sm ${testResults.payment_stripe.success
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}>
                                        <div className="flex items-center">
                                            {testResults.payment_stripe.success ? (
                                                <Check className="h-4 w-4 mr-2" />
                                            ) : (
                                                <X className="h-4 w-4 mr-2" />
                                            )}
                                            {testResults.payment_stripe.success ? 'Conexión exitosa' : testResults.payment_stripe.error}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* PayPal */}
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                    <DollarSign className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h5 className="font-medium text-gray-900">PayPal</h5>
                                    <p className="text-sm text-gray-500">Pagos con PayPal</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {paymentForms.paypal.enabled && (
                                    <button
                                        onClick={() => handleTest('payment', 'paypal')}
                                        disabled={saving}
                                        className="p-2 text-blue-600 hover:text-blue-500 hover:bg-blue-50 rounded-md"
                                        title="Probar configuración"
                                    >
                                        <TestTube className="h-4 w-4" />
                                    </button>
                                )}
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={paymentForms.paypal.enabled}
                                        onChange={(e) => handleTogglePaymentConfig('paypal', e.target.checked)}
                                        disabled={saving}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>

                        {paymentForms.paypal.enabled && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Client ID *
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentForms.paypal.client_id}
                                        onChange={(e) => handlePaymentConfigChange('paypal', 'client_id', e.target.value)}
                                        placeholder="Client ID de PayPal"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Client Secret *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showSecrets.paypal_secret ? 'text' : 'password'}
                                            value={paymentForms.paypal.client_secret}
                                            onChange={(e) => handlePaymentConfigChange('paypal', 'client_secret', e.target.value)}
                                            placeholder="Client Secret de PayPal"
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleSecretVisibility('paypal_secret')}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                                        >
                                            {showSecrets.paypal_secret ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={paymentForms.paypal.sandbox}
                                        onChange={(e) => handlePaymentConfigChange('paypal', 'sandbox', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                                    />
                                    <label className="text-sm text-gray-700">Modo Sandbox (Pruebas)</label>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handleTogglePaymentConfig('paypal', true)}
                                        disabled={saving || !paymentForms.paypal.client_id || !paymentForms.paypal.client_secret}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {saving ? 'Guardando...' : 'Guardar PayPal'}
                                    </button>
                                </div>
                                {testResults.payment_paypal && (
                                    <div className={`p-3 rounded-md text-sm ${testResults.payment_paypal.success
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}>
                                        <div className="flex items-center">
                                            {testResults.payment_paypal.success ? (
                                                <Check className="h-4 w-4 mr-2" />
                                            ) : (
                                                <X className="h-4 w-4 mr-2" />
                                            )}
                                            {testResults.payment_paypal.success ? 'Conexión exitosa' : testResults.payment_paypal.error}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Cuentas Bancarias */}
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                    <Building2 className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <h5 className="font-medium text-gray-900">Cuentas Bancarias</h5>
                                    <p className="text-sm text-gray-500">Transferencias bancarias directas</p>
                                </div>
                            </div>
                            <button
                                onClick={addBankAccount}
                                disabled={saving}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                <Building2 className="h-4 w-4 mr-2" />
                                Agregar Cuenta
                            </button>
                        </div>

                        {bankAccounts.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-sm">No hay cuentas bancarias configuradas</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Haz clic en "Agregar Cuenta" para configurar tu primera cuenta bancaria
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bankAccounts.map((account, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                                                <div className={`h-3 w-3 rounded-full mr-2 ${account.enabled ? 'bg-green-500' : 'bg-gray-300'
                                                    }`} />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {account.bank_name || `Cuenta Bancaria ${index + 1}`}
                                                </span>
                                                {account.id && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                        Guardada
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeBankAccount(index)}
                                                disabled={saving}
                                                className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                                                title="Eliminar cuenta"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Nombre del Banco *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={account.bank_name}
                                                        onChange={(e) => updateBankAccount(index, 'bank_name', e.target.value)}
                                                        placeholder="Ej: Banco Nacional"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Titular de la Cuenta *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={account.account_holder}
                                                        onChange={(e) => updateBankAccount(index, 'account_holder', e.target.value)}
                                                        placeholder="Nombre completo del titular"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Número de Cuenta *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={account.account_number}
                                                        onChange={(e) => updateBankAccount(index, 'account_number', e.target.value)}
                                                        placeholder="Número de cuenta"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Routing Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={account.routing_number}
                                                        onChange={(e) => updateBankAccount(index, 'routing_number', e.target.value)}
                                                        placeholder="Routing number (US)"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        SWIFT Code (Internacional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={account.swift_code}
                                                        onChange={(e) => updateBankAccount(index, 'swift_code', e.target.value)}
                                                        placeholder="Código SWIFT para transferencias internacionales"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => saveBankAccount(index)}
                                                    disabled={
                                                        saving ||
                                                        !account.bank_name ||
                                                        !account.account_holder ||
                                                        !account.account_number
                                                    }
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {saving ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            Guardando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="h-4 w-4 mr-2" />
                                                            {account.id ? 'Actualizar Cuenta' : 'Guardar Cuenta'}
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Información de estado para cuentas guardadas */}
                                            {account.id && (
                                                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                                    <div className="flex items-center">
                                                        <Check className="h-4 w-4 text-green-600 mr-2" />
                                                        <span className="text-sm text-green-700">
                                                            Cuenta bancaria configurada correctamente
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-green-600 mt-1">
                                                        Los clientes podrán utilizar esta cuenta para transferencias bancarias
                                                    </p>
                                                </div>
                                            )}

                                            {/* Validación de campos requeridos */}
                                            {(!account.bank_name || !account.account_holder || !account.account_number) && (
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                                    <div className="flex items-center">
                                                        <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                                                        <span className="text-sm text-yellow-700">
                                                            Completa todos los campos requeridos (*) para guardar la cuenta
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Configuraciones de Email */}
            <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-base font-medium text-gray-900 flex items-center">
                        <Mail className="h-5 w-5 mr-2" />
                        Configuración de Email
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                        Configura el proveedor de email para notificaciones y comunicaciones
                    </p>
                </div>

                <div className="p-6">
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                                    <Mail className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <h5 className="font-medium text-gray-900">Resend</h5>
                                    <p className="text-sm text-gray-500">API de email transaccional</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {emailForm.resend.enabled && (
                                    <button
                                        onClick={() => handleTest('email', 'resend')}
                                        disabled={saving}
                                        className="p-2 text-blue-600 hover:text-blue-500 hover:bg-blue-50 rounded-md"
                                        title="Probar configuración"
                                    >
                                        <TestTube className="h-4 w-4" />
                                    </button>
                                )}
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={emailForm.resend.enabled}
                                        onChange={(e) => handleToggleEmailConfig(e.target.checked)}
                                        disabled={saving}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>

                        {emailForm.resend.enabled && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        API Key *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showSecrets.resend_api ? 'text' : 'password'}
                                            value={emailForm.resend.api_key}
                                            onChange={(e) => handleEmailConfigChange('resend', 'api_key', e.target.value)}
                                            placeholder="re_..."
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleSecretVisibility('resend_api')}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                                        >
                                            {showSecrets.resend_api ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        From Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={emailForm.resend.from_email}
                                        onChange={(e) => handleEmailConfigChange('resend', 'from_email', e.target.value)}
                                        placeholder="noreply@tudominio.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        From Name
                                    </label>
                                    <input
                                        type="text"
                                        value={emailForm.resend.from_name}
                                        onChange={(e) => handleEmailConfigChange('resend', 'from_name', e.target.value)}
                                        placeholder="Tu Empresa"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSaveEmailConfig} // Cambiar esta línea
                                        disabled={saving || !emailForm.resend.api_key || !emailForm.resend.from_email}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                                    >
                                        {saving ? 'Guardando...' : 'Guardar Email'}
                                    </button>
                                </div>
                                {testResults.email_resend && (
                                    <div className={`p-3 rounded-md text-sm ${testResults.email_resend.success
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}>
                                        <div className="flex items-center">
                                            {testResults.email_resend.success ? (
                                                <Check className="h-4 w-4 mr-2" />
                                            ) : (
                                                <X className="h-4 w-4 mr-2" />
                                            )}
                                            {testResults.email_resend.success ? 'Configuración válida' : testResults.email_resend.error}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Estado de guardado */}
            {saving && (
                <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando configuración...
                    </div>
                </div>
            )}
        </div>
    )
}