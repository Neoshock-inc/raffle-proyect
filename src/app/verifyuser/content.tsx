'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
    validateReferralById,
    registerReferredUser,
    linkUserToReferral,
    ReferralInfo,
    TenantInfo
} from '@/admin/services/referralAuthService'
import {
    validateAmbassadorById,
    registerAmbassadorUser,
    linkUserToAmbassador,
    AmbassadorInfo,
    TenantInfo as AmbassadorTenantInfo
} from '@/admin/services/ambassadorAuthService'

type VerifyMode = 'referral' | 'ambassador' | null

export default function VerifyUserContent() {
    const searchParams = useSearchParams()
    const referralId = searchParams.get('referralId')
    const ambassadorId = searchParams.get('ambassadorId')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [mode, setMode] = useState<VerifyMode>(null)

    // Referral state
    const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null)
    // Ambassador state
    const [ambassadorInfo, setAmbassadorInfo] = useState<AmbassadorInfo | null>(null)
    // Shared tenant info
    const [tenantInfo, setTenantInfo] = useState<TenantInfo | AmbassadorTenantInfo | null>(null)

    useEffect(() => {
        const loadInfo = async () => {
            // Ambassador takes priority
            if (ambassadorId) {
                setMode('ambassador')
                try {
                    const { ambassador, tenant } = await validateAmbassadorById(ambassadorId)
                    setAmbassadorInfo(ambassador)
                    setTenantInfo(tenant)
                } catch (err: any) {
                    setError(err.message || 'Error al cargar información del embajador')
                } finally {
                    setInitialLoading(false)
                }
                return
            }

            if (referralId) {
                setMode('referral')
                try {
                    const { referral, tenant } = await validateReferralById(referralId)
                    setReferralInfo(referral)
                    setTenantInfo(tenant)
                } catch (err: any) {
                    setError(err.message || 'Error al cargar información del referido')
                } finally {
                    setInitialLoading(false)
                }
                return
            }

            setError('No se proporcionó ID de referido ni embajador')
            setInitialLoading(false)
        }

        loadInfo()
    }, [referralId, ambassadorId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess(false)

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setLoading(true)
        try {
            if (mode === 'ambassador' && ambassadorId && ambassadorInfo) {
                const user = await registerAmbassadorUser(
                    ambassadorInfo.email,
                    password,
                    ambassadorInfo.tenant_id
                )
                if (!user) throw new Error('No se pudo registrar el usuario')
                await linkUserToAmbassador(ambassadorId, user.id)
            } else if (mode === 'referral' && referralId && referralInfo) {
                const user = await registerReferredUser(
                    referralInfo.email,
                    password,
                    referralInfo.tenant_id
                )
                if (!user) throw new Error('No se pudo registrar el usuario')
                await linkUserToReferral(referralId, user.id)
            } else {
                throw new Error('No se encontró información válida')
            }

            setSuccess(true)
            setTimeout(() => {
                window.location.href = 'https://app.myfortunacloud.com/dashboard'
            }, 2000)
        } catch (err: any) {
            setError(err.message || 'Error al registrar')
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100">
                <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando información...</p>
                </div>
            </div>
        )
    }

    const primaryColor = tenantInfo?.primary_color || '#3B82F6'
    const companyName = tenantInfo?.company_name || tenantInfo?.name || 'Nuestro Sistema'
    const entityInfo = mode === 'ambassador' ? ambassadorInfo : referralInfo
    const entityCode = mode === 'ambassador' ? ambassadorInfo?.ambassador_code : referralInfo?.referral_code
    const roleLabel = mode === 'ambassador' ? 'embajador' : 'referido'

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                background: `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}10)`
            }}
        >
            <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full">
                {tenantInfo?.logo_url && (
                    <div className="text-center mb-6">
                        <img
                            src={tenantInfo.logo_url}
                            alt={`${companyName} Logo`}
                            className="max-w-24 h-auto mx-auto"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none'
                            }}
                        />
                    </div>
                )}

                <h1
                    className="text-3xl font-semibold text-center mb-4"
                    style={{ color: primaryColor }}
                >
                    {companyName}
                </h1>

                {entityInfo && (
                    <>
                        <div
                            className="bg-gray-50 rounded-lg p-4 mb-6 border-l-4"
                            style={{ borderLeftColor: primaryColor }}
                        >
                            <p className="text-sm text-gray-700">
                                <strong>Nombre:</strong> {entityInfo.name}
                            </p>
                            <p className="text-sm text-gray-700">
                                <strong>Código:</strong> {entityCode}
                            </p>
                            <p className="text-sm text-gray-700">
                                <strong>Tu correo:</strong> {entityInfo.email}
                            </p>
                        </div>

                        <p className="text-sm text-gray-600 text-center mb-6">
                            {mode === 'ambassador'
                                ? 'Gracias por unirte como embajador. Podrás gestionar tu equipo de referidos y ganar comisiones en cascada.'
                                : 'Gracias por unirte como referido a nuestra comunidad.'
                            }
                            {' '}Para finalizar tu registro, por favor crea una contraseña segura.
                        </p>
                    </>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password"
                        placeholder="Contraseña (mínimo 6 caracteres)"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                        style={{
                            focusRingColor: primaryColor,
                            '--tw-ring-color': primaryColor
                        } as any}
                        required
                        minLength={6}
                    />
                    <input
                        type="password"
                        placeholder="Confirmar contraseña"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                        style={{
                            focusRingColor: primaryColor,
                            '--tw-ring-color': primaryColor
                        } as any}
                        required
                        minLength={6}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 text-white font-semibold rounded-md transition disabled:opacity-50 hover:opacity-90"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {loading ? 'Registrando...' : 'Crear mi cuenta'}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm text-center">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-600 text-sm text-center">
                            ¡Registro exitoso! Redirigiendo al inicio de sesión...
                        </p>
                    </div>
                )}

                <div className="mt-8 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        {mode === 'ambassador'
                            ? 'Al crear tu cuenta, podrás acceder al panel de embajador, gestionar tu equipo y ganar comisiones por ventas de tu equipo.'
                            : 'Al crear tu cuenta, podrás acceder al panel de referidos y comenzar a ganar comisiones por cada venta referida.'
                        }
                    </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="text-center">
                        <p className="text-xs text-gray-400 mb-2">
                            Sistema de {roleLabel}s powered by
                        </p>
                        <div className="flex items-center justify-center space-x-2">
                            <img
                                src="https://wpffdsoqmlfplhlefcwf.supabase.co/storage/v1/object/public/main/main_logo.png"
                                alt="My Fortuna Cloud"
                                className="h-5 w-auto"
                            />
                            <span className="text-xs font-medium text-gray-600">
                                My Fortuna Cloud
                            </span>
                        </div>
                        {tenantInfo?.domain && (
                            <p className="text-xs text-gray-400 mt-1">
                                {tenantInfo.domain}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
