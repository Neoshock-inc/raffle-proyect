// src/app/(auth)/layout.tsx
'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { authService } from './services/authService'
import { Menu } from '@headlessui/react'
import { Toaster } from 'sonner'
import { LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUserFeatures } from './hooks/useUserFeatures'
import { iconMap } from './utils/iconMap'


export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const router = useRouter()
    const pathname = usePathname()
    const [isReferred, setIsReferred] = useState<boolean | null>(null)
    const [loading, setLoading] = useState(true) // <-- estado loading
    const { menuGroups, loading: featuresLoading } = useUserFeatures();

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
        if (!featuresLoading) {
            const allFeatures = menuGroups.flatMap(group => [group.parent, ...group.children])
            if (allFeatures.length === 1) {
                router.push(allFeatures[0].route)
            }
        }
    }, [menuGroups, featuresLoading])


    const handleLogout = async () => {
        try {
            await authService.signOut()
            router.push('/login')
        } catch (error) {
            console.error('Error al cerrar sesión', error)
        }
    }

    if (loading || featuresLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Cargando...
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
                    Tu cuenta no tiene módulos habilitados aún. Por favor contacta al administrador para obtener acceso.
                </p>
                <button
                    onClick={handleLogout}
                    className="mt-6 px-4 py-2 text-white bg-[#800000] rounded-lg hover:bg-red-700 transition"
                >
                    Cerrar sesión
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-18'} overflow-hidden bg-white shadow-lg transition-all duration-300 flex flex-col`}>
                {/* Logo + Toggle */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    {sidebarOpen ? (
                        <Image
                            src="/images/logo-secondary.png"
                            alt="Logo"
                            width={200}
                            height={300}
                            className="object-contain"
                        />
                    ) : (
                        <Image
                            src="/images/main_logo.jpeg"
                            alt="Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                    )}

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="ml-2 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title={sidebarOpen ? 'Contraer menú' : 'Expandir menú'}
                    >
                        {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </button>
                </div>

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
                                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isParentActive ? 'bg-[#800000] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
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
                                                            className={`flex items-center px-3 py-1.5 rounded-lg text-sm transition-colors ${isChildActive ? 'bg-[#800000] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
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
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-3.5">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-semibold text-gray-800">
                            {
                                menuGroups
                                    .flatMap(g => [g.parent, ...g.children])
                                    .find(f => f.route === pathname)?.label || 'Dashboard'
                            }
                        </h1>

                        {userEmail && (
                            <Menu as="div" className="relative inline-block text-left">
                                <Menu.Button className="flex items-center text-gray-700 hover:text-gray-900 font-medium">
                                    <div className="w-8 h-8 bg-[#800000] rounded-full flex items-center justify-center text-white text-sm font-medium mr-2">
                                        {userEmail.charAt(0).toUpperCase()}
                                    </div>
                                    {userEmail}
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