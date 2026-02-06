// 📁 components/tenant-details/tabs/ConfigurationsTab.tsx
import { useTenantConfigurations } from '@/admin/hooks/useTenantConfigurations'
import {
    CreditCard, Mail, DollarSign, Building2,
    Check, X, TestTube, Eye, EyeOff, Save, AlertCircle
} from 'lucide-react'
import { useState } from 'react'

interface ConfigurationsTabProps {
    tenantId: string
}

// Definición de tipos para los campos de cada proveedor
interface ProviderField {
    key: string
    label: string
    type: 'text' | 'password' | 'email' | 'checkbox'
    placeholder?: string
    required?: boolean
    description?: string
}

interface PaymentProviderConfig {
    id: string
    name: string
    description: string
    icon: any
    iconColor: string
    iconBg: string
    buttonColor: string
    fields: ProviderField[]
}

// Configuración de todos los proveedores de pago
const PAYMENT_PROVIDERS: PaymentProviderConfig[] = [
    {
        id: 'stripe',
        name: 'Stripe',
        description: 'Procesamiento de tarjetas de crédito',
        icon: CreditCard,
        iconColor: 'text-purple-600',
        iconBg: 'bg-purple-100',
        buttonColor: 'bg-purple-600 hover:bg-purple-700',
        fields: [
            {
                key: 'public_key',
                label: 'Publishable Key',
                type: 'text',
                placeholder: 'pk_test_...',
                required: true
            },
            {
                key: 'secret_key',
                label: 'Secret Key',
                type: 'password',
                placeholder: 'sk_test_...',
                required: true
            }
        ]
    },
    {
        id: 'paypal',
        name: 'PayPal',
        description: 'Pagos con PayPal',
        icon: DollarSign,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
        fields: [
            {
                key: 'client_id',
                label: 'Client ID',
                type: 'text',
                placeholder: 'Client ID de PayPal',
                required: true
            },
            {
                key: 'client_secret',
                label: 'Client Secret',
                type: 'password',
                placeholder: 'Client Secret de PayPal',
                required: true
            },
            {
                key: 'sandbox',
                label: 'Modo Sandbox (Pruebas)',
                type: 'checkbox',
                description: 'Habilitar modo de pruebas'
            }
        ]
    },
    {
        id: 'payphone',
        name: 'Payphone',
        description: 'Pagos móviles Ecuador',
        icon: CreditCard,
        iconColor: 'text-indigo-600',
        iconBg: 'bg-indigo-100',
        buttonColor: 'bg-indigo-600 hover:bg-indigo-700',
        fields: [
            {
                key: 'token',
                label: 'Token',
                type: 'password',
                placeholder: 'Token de Payphone',
                required: true
            },
            {
                key: 'store_id',
                label: 'Store ID',
                type: 'text',
                placeholder: 'ID de la tienda',
                required: true
            }
        ]
    },
    {
        id: 'kushki',
        name: 'Kushki',
        description: 'Pagos Latinoamérica',
        icon: CreditCard,
        iconColor: 'text-teal-600',
        iconBg: 'bg-teal-100',
        buttonColor: 'bg-teal-600 hover:bg-teal-700',
        fields: [
            {
                key: 'public_key',
                label: 'Public Merchant ID',
                type: 'text',
                placeholder: 'Public Merchant ID',
                required: true
            },
            {
                key: 'private_key',
                label: 'Private Merchant ID',
                type: 'password',
                placeholder: 'Private Merchant ID',
                required: true
            },
            {
                key: 'test_mode',
                label: 'Modo de Pruebas',
                type: 'checkbox',
                description: 'Usar ambiente de pruebas'
            }
        ]
    }
]

export function ConfigurationsTab({ tenantId }: ConfigurationsTabProps) {
    const {
        loading,
        saving,
        paymentForms,
        emailForm,
        bankAccounts,
        setPaymentForms,
        setEmailForm,
        updatePaymentConfig,
        updateEmailConfig,
        testConfiguration,
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

    // Handler genérico para cambios en configuración de pagos
    const handlePaymentConfigChange = (providerId: string, field: string, value: any) => {
        setPaymentForms(prev => ({
            ...prev,
            [providerId]: {
                ...prev[providerId],
                [field]: value
            }
        }))
    }

    // Handler genérico para activar/desactivar proveedores
    const handleTogglePaymentConfig = async (providerId: string, enabled: boolean) => {
        const result = await updatePaymentConfig(providerId, enabled)
        if (!result.success) {
            console.error('Error updating payment config:', result.error)
            alert('Error al guardar: ' + result.error)
        }
    }

    // Verificar si todos los campos requeridos están completos
    const areRequiredFieldsFilled = (providerId: string, provider: PaymentProviderConfig) => {
        const config = paymentForms[providerId]
        if (!config) return false

        return provider.fields
            .filter(field => field.required)
            .every(field => config[field.key] && config[field.key].toString().trim() !== '')
    }

    const handleTest = async (type: 'payment' | 'email', provider: string) => {
        const result = await testConfiguration(type, provider)
        setTestResults(prev => ({
            ...prev,
            [`${type}_${provider}`]: result
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

    const handleSaveEmailConfig = async () => {
        if (!emailForm.resend.api_key || !emailForm.resend.from_email) {
            alert('Faltan la API key o el email remitente')
            return
        }

        const result = await updateEmailConfig(true)
        if (!result.success) {
            console.error('Error updating email config:', result.error)
            alert('Error al guardar: ' + result.error)
        }
    }

    const handleToggleEmailConfig = async (enabled: boolean) => {
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
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Configuraciones del Tenant
                </h3>
                <p className="text-sm text-gray-500">
                    Configura los métodos de pago y servicios de email para tu tenant
                </p>
            </div>

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
                    {PAYMENT_PROVIDERS.map((provider) => {
                        const Icon = provider.icon
                        const providerConfig = paymentForms[provider.id] || { enabled: false }

                        return (
                            <div key={provider.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className={`h-10 w-10 ${provider.iconBg} rounded-lg flex items-center justify-center mr-3`}>
                                            <Icon className={`h-5 w-5 ${provider.iconColor}`} />
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-gray-900">{provider.name}</h5>
                                            <p className="text-sm text-gray-500">{provider.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {providerConfig.enabled && (
                                            <button
                                                onClick={() => handleTest('payment', provider.id)}
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
                                                checked={providerConfig.enabled}
                                                onChange={(e) => handleTogglePaymentConfig(provider.id, e.target.checked)}
                                                disabled={saving}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>

                                {providerConfig.enabled && (
                                    <div className="space-y-3">
                                        {provider.fields.map((field) => {
                                            if (field.type === 'checkbox') {
                                                return (
                                                    <div key={field.key} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={providerConfig[field.key] || false}
                                                            onChange={(e) => handlePaymentConfigChange(provider.id, field.key, e.target.checked)}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                                                        />
                                                        <label className="text-sm text-gray-700">
                                                            {field.label}
                                                        </label>
                                                    </div>
                                                )
                                            }

                                            return (
                                                <div key={field.key}>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        {field.label} {field.required && '*'}
                                                    </label>
                                                    {field.type === 'password' ? (
                                                        <div className="relative">
                                                            <input
                                                                type={showSecrets[`${provider.id}_${field.key}`] ? 'text' : 'password'}
                                                                value={providerConfig[field.key] || ''}
                                                                onChange={(e) => handlePaymentConfigChange(provider.id, field.key, e.target.value)}
                                                                placeholder={field.placeholder}
                                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                                required={field.required}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleSecretVisibility(`${provider.id}_${field.key}`)}
                                                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                            >
                                                                {showSecrets[`${provider.id}_${field.key}`] ? (
                                                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4 text-gray-400" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type={field.type}
                                                            value={providerConfig[field.key] || ''}
                                                            onChange={(e) => handlePaymentConfigChange(provider.id, field.key, e.target.value)}
                                                            placeholder={field.placeholder}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                            required={field.required}
                                                        />
                                                    )}
                                                </div>
                                            )
                                        })}

                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleTogglePaymentConfig(provider.id, true)}
                                                disabled={saving || !areRequiredFieldsFilled(provider.id, provider)}
                                                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${provider.buttonColor} disabled:opacity-50`}
                                            >
                                                {saving ? 'Guardando...' : `Guardar ${provider.name}`}
                                            </button>
                                        </div>

                                        {testResults[`payment_${provider.id}`] && (
                                            <div className={`p-3 rounded-md text-sm ${testResults[`payment_${provider.id}`].success
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : 'bg-red-50 text-red-700 border border-red-200'
                                                }`}>
                                                <div className="flex items-center">
                                                    {testResults[`payment_${provider.id}`].success ? (
                                                        <Check className="h-4 w-4 mr-2" />
                                                    ) : (
                                                        <X className="h-4 w-4 mr-2" />
                                                    )}
                                                    {testResults[`payment_${provider.id}`].success
                                                        ? 'Conexión exitosa'
                                                        : testResults[`payment_${provider.id}`].error}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}

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
                                                <div className={`h-3 w-3 rounded-full mr-2 ${account.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
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

                                            {account.id && (
                                                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                                    <div className="flex items-center">
                                                        <Check className="h-4 w-4 text-green-600 mr-2" />
                                                        <span className="text-sm text-green-700">
                                                            Cuenta bancaria configurada correctamente
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

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
                                        onClick={handleSaveEmailConfig}
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