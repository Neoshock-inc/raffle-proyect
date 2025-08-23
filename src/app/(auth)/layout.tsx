// src/app/(auth)/layout.tsx - VERSIÓN ACTUALIZADA CON TENANT CONTEXT
'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { authService } from './services/authService'
import { Menu } from '@headlessui/react'
import { Toaster } from 'sonner'
import { LayoutDashboard, ChevronLeft, ChevronRight, Building2, Globe } from 'lucide-react'
import { useUserFeatures } from './hooks/useUserFeatures'
import { useTenantContext } from './hooks/useTenantContext'
import { iconMap } from './utils/iconMap'
import { Tenant } from './types/tenant'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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

    // Features basadas en el tenant actual
    const { menuGroups, loading: featuresLoading } = useUserFeatures(
        currentTenant?.id || null
    )

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
        setCurrentTenant(tenant)
        // Redirigir al dashboard cuando cambie el tenant
        router.push('/dashboard')
    }

    if (loading || tenantLoading || featuresLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        )
    }

    const allFeatures = menuGroups.flatMap(group => [group.parent, ...group.children])

    if (allFeatures.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
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
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-18'} overflow-hidden bg-[#f7f7f7] shadow-lg transition-all duration-300 flex flex-col`}>
                {/* Logo + Toggle */}
                <div className="p-4 border-b border-gray-200 flex flex-col items-center gap-2">
                    <Image
                        src="/images/main_logo.jpeg"
                        alt="Logo"
                        width={sidebarOpen ? 120 : 40}
                        height={40}
                        className="object-contain transition-all"
                    />
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title={sidebarOpen ? 'Contraer menú' : 'Expandir menú'}
                    >
                        {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </button>
                </div>

                {/* Indicador de Tenant Actual */}
                {sidebarOpen && (
                    <div className="px-4 py-3 bg-sky-50 border-b border-sky-100">
                        <div className="flex items-center text-sm">
                            <Building2 className="h-4 w-4 text-sky-600 mr-2 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-sky-600 font-medium">
                                    {isAdmin ? 'Cliente Actual:' : 'Tu Cliente:'}
                                </p>
                                <p className="text-sky-800 font-semibold truncate">
                                    {currentTenant ? currentTenant.name : 'Vista Global'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6">
                    <ul className="space-y-2">
                        {menuGroups.map(({ parent, children }) => {
                            const ParentIcon = iconMap[parent.icon] ?? LayoutDashboard
                            const isParentActive = pathname === parent.route || children.some(child => pathname === child.route)

                            return (
                                <li key={parent.id}>
                                    <Link
                                        href={parent.route}
                                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isParentActive ? 'bg-sky-700 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <ParentIcon className="h-5 w-5 flex-shrink-0" />
                                        {sidebarOpen && <span className="ml-3">{parent.label}</span>}
                                    </Link>

                                    {children.length > 0 && (
                                        <ul className="mt-1 pl-6 space-y-1">
                                            {children.map((child) => {
                                                const ChildIcon = iconMap[child.icon] ?? LayoutDashboard
                                                const isChildActive = pathname === child.route
                                                return (
                                                    <li key={child.id}>
                                                        <Link
                                                            href={child.route}
                                                            className={`flex items-center px-3 py-1.5 rounded-lg text-sm transition-colors ${isChildActive ? 'bg-sky-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                                        >
                                                            <ChildIcon className="h-4 w-4 flex-shrink-0" />
                                                            {sidebarOpen && <span className="ml-2">{child.label}</span>}
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
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-[#f7f7f7] shadow-sm border-b border-gray-200 px-6 py-3.5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-semibold text-gray-800">
                                {menuGroups
                                    .flatMap(g => [g.parent, ...g.children])
                                    .find(f => f.route === pathname)?.label || 'Dashboard'}
                            </h1>

                            {/* Selector de Tenant (Solo para Admins) */}
                            {isAdmin && (
                                <div className="flex items-center">
                                    <Menu as="div" className="relative inline-block text-left">
                                        <Menu.Button className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                                            <Globe className="h-4 w-4 mr-2" />
                                            {currentTenant ? currentTenant.name : 'Seleccionar Cliente'}
                                            <svg className="-mr-1 ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </Menu.Button>

                                        <Menu.Items className="absolute left-0 z-10 mt-2 w-72 origin-top-left bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                                            <div className="py-1">
                                                {/* Vista Global */}
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => handleTenantChange(null)}
                                                            className={`${active ? 'bg-gray-100' : ''
                                                                } ${!currentTenant ? 'bg-sky-50 text-sky-700' : 'text-gray-700'
                                                                } w-full text-left px-4 py-2 text-sm flex items-center`}
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
                                                <div className="border-t border-gray-200 my-1"></div>

                                                {/* Lista de Tenants */}
                                                {availableTenants.map((tenant) => (
                                                    <Menu.Item key={tenant.id}>
                                                        {({ active }) => (
                                                            <button
                                                                onClick={() => handleTenantChange(tenant)}
                                                                className={`${active ? 'bg-gray-100' : ''
                                                                    } ${currentTenant?.id === tenant.id ? 'bg-sky-50 text-sky-700' : 'text-gray-700'
                                                                    } w-full text-left px-4 py-2 text-sm flex items-center`}
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

                        {/* User Menu */}
                        {userEmail && (
                            <Menu as="div" className="relative inline-block text-left">
                                <Menu.Button className="flex items-center text-gray-700 hover:text-gray-900 font-medium">
                                    <div className="w-8 h-8 bg-sky-700 rounded-full flex items-center justify-center text-white text-sm font-medium mr-2">
                                        {userEmail.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm">{userEmail}</p>
                                        <p className="text-xs text-gray-500">
                                            {isAdmin ? 'Administrador' : 'Cliente'}
                                        </p>
                                    </div>
                                </Menu.Button>
                                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white shadow-lg rounded-md border border-gray-200 z-50">
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }: { active: boolean }) => (
                                                <button
                                                    onClick={handleLogout}
                                                    className={`${active ? 'bg-gray-100' : ''
                                                        } w-full text-left px-4 py-2 text-sm text-gray-700`}
                                                >
                                                    Cerrar sesión
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Menu>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 bg-gray-50">
                    {children}
                    <Toaster position="top-right" toastOptions={{ className: 'z-[9999]' }} />
                </main>
            </div>
        </div>
    )
}