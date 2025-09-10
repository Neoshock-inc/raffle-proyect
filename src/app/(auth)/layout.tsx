// src/app/(auth)/layout.tsx - REDISEÑADO MANTENIENDO ESENCIA ORIGINAL
'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { authService } from './services/authService'
import { Menu } from '@headlessui/react'
import { Toaster } from 'sonner'
import { LayoutDashboard, Building2, Globe, Bell, SquareMenu } from 'lucide-react'
import { useUserFeatures } from './hooks/useUserFeatures'
import { TenantProvider, useTenantContext } from './contexts/TenantContext'
import { iconMap } from './utils/iconMap'
import { Tenant } from './types/tenant'

// Componente interno que usa el context
function AuthLayoutContent({ children }: { children: React.ReactNode }) {
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const router = useRouter()
    const pathname = usePathname()
    const [loading, setLoading] = useState(true)

    // Contexto de tenant
    const {
        isAdmin,
        currentTenant,
        availableTenants,
        loading: tenantLoading,
        setCurrentTenant
    } = useTenantContext()

    // CAMBIO CLAVE: Para admins, siempre usar null para obtener el menú completo
    // Para customers, usar su tenant específico
    const tenantIdForFeatures = isAdmin ? null : currentTenant?.id || null

    // Features basadas en null para admins (menú completo) o tenant específico para customers
    const { menuGroups, loading: featuresLoading } = useUserFeatures(tenantIdForFeatures)

    useEffect(() => {
        authService.getUser()
            .then(async (user) => {
                if (!user) {
                    router.push('/login')
                    return
                }
                setUserEmail(user.email ?? null)
            })
            .catch(() => router.push('/login'))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (!featuresLoading && !tenantLoading) {
            const allFeatures = menuGroups.flatMap(group => [group.parent, ...group.children])
            if (allFeatures.length === 1) {
                router.push(allFeatures[0].route)
            }
        }
    }, [menuGroups, featuresLoading, tenantLoading])

    const handleLogout = async () => {
        try {
            await authService.signOut()
            router.push('/login')
        } catch (error) {
            console.error('Error al cerrar sesión', error)
        }
    }

    const handleTenantChange = (tenant: Tenant | null) => {
        console.log('🔄 Admin changing tenant view to:', tenant?.name || 'Global View');
        setCurrentTenant(tenant) // ESTO DISPARA CAMBIOS EN TODA LA APP
    }

    if (loading || tenantLoading || featuresLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando... 1</p>
                </div>
            </div>
        )
    }

    const allFeatures = menuGroups.flatMap(group => [group.parent, ...group.children])

    if (allFeatures.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4">
                <Image src="/images/main_logo.jpeg" alt="Logo" width={80} height={80} />
                <h1 className="text-2xl font-semibold mt-4 text-gray-800">Sin acceso</h1>
                <p className="text-gray-600 mt-2 max-w-sm">
                    {isAdmin && !currentTenant
                        ? "Selecciona un cliente para acceder a sus módulos."
                        : "Tu cuenta no tiene módulos habilitados aún. Por favor contacta al administrador para obtener acceso."
                    }
                </p>
                <button
                    onClick={handleLogout}
                    className="mt-6 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                >
                    Cerrar sesión
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar - Fixed sin scroll */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg border-r border-gray-200 transition-all duration-300 flex flex-col fixed h-full z-30`}>
                {/* Logo + Toggle - Una sola línea horizontal */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/images/main_logo.jpeg"
                            alt="MyFortunaCloud Logo"
                            width={sidebarOpen ? 40 : 32}
                            height={sidebarOpen ? 40 : 32}
                            className="object-contain transition-all"
                        />
                        {sidebarOpen && (
                            <h1 className="text-lg font-bold text-gray-800">Bienvenido</h1>
                        )}
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title={sidebarOpen ? 'Contraer menú' : 'Expandir menú'}
                    >
                        <SquareMenu className="h-5 w-5" />
                    </button>
                </div>

                {/* Indicador de Tenant Actual */}
                {sidebarOpen && (
                    <div className="px-4 py-3 bg-sky-50 border-b border-sky-100">
                        <div className="flex items-center text-sm">
                            <Building2 className="h-4 w-4 text-sky-600 mr-2 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-sky-600 font-medium">
                                    {isAdmin ? 'Vista Actual:' : 'Tu Cliente:'}
                                </p>
                                <p className="text-sky-800 font-semibold truncate">
                                    {isAdmin && !currentTenant
                                        ? 'Vista Global'
                                        : currentTenant?.name || 'Sin asignar'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation - Scrollable independiente */}
                <nav className="flex-1 overflow-y-auto px-4 py-6">
                    <ul className="space-y-2">
                        {menuGroups.map(({ parent, children }) => {
                            const ParentIcon = iconMap[parent.icon] ?? LayoutDashboard
                            const isParentActive = pathname === parent.route || children.some(child => pathname === child.route)

                            return (
                                <li key={parent.id}>
                                    <Link
                                        href={parent.route}
                                        className={`flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                            isParentActive 
                                                ? 'bg-sky-600 text-white shadow-sm' 
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                        title={!sidebarOpen ? parent.label : undefined}
                                    >
                                        <ParentIcon className="h-5 w-5 flex-shrink-0" />
                                        {sidebarOpen && <span className="ml-3">{parent.label}</span>}
                                    </Link>

                                    {children.length > 0 && sidebarOpen && (
                                        <ul className="mt-1 ml-6 space-y-1">
                                            {children.map((child) => {
                                                const ChildIcon = iconMap[child.icon] ?? LayoutDashboard
                                                const isChildActive = pathname === child.route
                                                return (
                                                    <li key={child.id}>
                                                        <Link
                                                            href={child.route}
                                                            className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                                                isChildActive 
                                                                    ? 'bg-sky-100 text-sky-700 font-medium' 
                                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                                                            }`}
                                                        >
                                                            <ChildIcon className="h-4 w-4 flex-shrink-0" />
                                                            <span className="ml-2">{child.label}</span>
                                                        </Link>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* Footer - Powered by */}
                {sidebarOpen && (
                    <div className="px-4 py-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                            Powered by My Fortuna Cloud
                        </p>
                    </div>
                )}
            </div>

            {/* Main Content - Con margen para el sidebar fijo */}
            <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-2 sticky top-0 z-20">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-semibold text-gray-800">
                                {menuGroups
                                    .flatMap(g => [g.parent, ...g.children])
                                    .find(f => f.route === pathname)?.label || 'Dashboard'}
                            </h1>

                            {/* Selector de Tenant (Solo para Admins) */}
                            {isAdmin && (
                                <div className="flex items-center">
                                    <Menu as="div" className="relative inline-block text-left">
                                        <Menu.Button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors">
                                            <Globe className="h-4 w-4 mr-2" />
                                            {currentTenant ? currentTenant.name : 'Vista Global'}
                                            <svg className="-mr-1 ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </Menu.Button>

                                        <Menu.Items className="absolute left-0 z-10 mt-2 w-72 origin-top-left bg-white shadow-lg rounded-xl border border-gray-200 max-h-60 overflow-y-auto">
                                            <div className="py-2">
                                                {/* Vista Global */}
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => handleTenantChange(null)}
                                                            className={`${active ? 'bg-gray-50' : ''} ${
                                                                !currentTenant ? 'bg-sky-50 text-sky-700' : 'text-gray-700'
                                                            } w-full text-left px-4 py-3 text-sm flex items-center rounded-lg mx-2`}
                                                        >
                                                            <Globe className="h-4 w-4 mr-3" />
                                                            <div>
                                                                <p className="font-medium">Vista Global</p>
                                                                <p className="text-xs text-gray-500">Todos los clientes</p>
                                                            </div>
                                                        </button>
                                                    )}
                                                </Menu.Item>

                                                {/* Separador */}
                                                <div className="border-t border-gray-200 my-2 mx-2"></div>

                                                {/* Lista de Tenants */}
                                                {availableTenants.map((tenant) => (
                                                    <Menu.Item key={tenant.id}>
                                                        {({ active }) => (
                                                            <button
                                                                onClick={() => handleTenantChange(tenant)}
                                                                className={`${active ? 'bg-gray-50' : ''} ${
                                                                    currentTenant?.id === tenant.id ? 'bg-sky-50 text-sky-700' : 'text-gray-700'
                                                                } w-full text-left px-4 py-3 text-sm flex items-center rounded-lg mx-2`}
                                                            >
                                                                <Building2 className="h-4 w-4 mr-3" />
                                                                <div>
                                                                    <p className="font-medium">{tenant.name}</p>
                                                                    <p className="text-xs text-gray-500">{tenant.slug}</p>
                                                                </div>
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                ))}
                                            </div>
                                        </Menu.Items>
                                    </Menu>
                                </div>
                            )}
                        </div>

                        {/* Right Section - Notifications + User */}
                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                                <Bell className="h-5 w-5" />
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                            </button>

                            {/* User Menu */}
                            {userEmail && (
                                <Menu as="div" className="relative inline-block text-left">
                                    <Menu.Button className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors">
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{userEmail}</p>
                                            <p className="text-xs text-gray-500">
                                                {isAdmin ? 'Administrador' : 'Cliente'}
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                            {userEmail.charAt(0).toUpperCase()}
                                        </div>
                                    </Menu.Button>
                                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white shadow-lg rounded-xl border border-gray-200 z-50 py-2">
                                        <Menu.Item>
                                            {({ active }: { active: boolean }) => (
                                                <button
                                                    onClick={handleLogout}
                                                    className={`${active ? 'bg-gray-50' : ''} w-full text-left px-4 py-3 text-sm text-gray-700 rounded-lg mx-2`}
                                                >
                                                    Cerrar sesión
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </Menu.Items>
                                </Menu>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
                    {children}
                    <Toaster position="top-right" toastOptions={{ className: 'z-[9999]' }} />
                </main>
            </div>
        </div>
    )
}

// Export principal: AuthLayout con TenantProvider envolviendo todo
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <TenantProvider>
            <AuthLayoutContent>
                {children}
            </AuthLayoutContent>
        </TenantProvider>
    )
}