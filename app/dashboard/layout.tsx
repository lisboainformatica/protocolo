
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    FileText,
    Settings,
    Users,
    LogOut,
    Menu,
    X,
    PlusCircle,
    BarChart
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Meus Protocolos', href: '/dashboard/protocols', icon: FileText },
        { name: 'Novo Protocolo', href: '/protocols/new', icon: PlusCircle },
    ];

    if (session?.user?.roles?.includes('administrador') || session?.user?.roles?.includes('gestor')) {
        navigation.push({ name: 'Workflows', href: '/dashboard/workflows', icon: Settings });
        navigation.push({ name: 'Relatórios', href: '/dashboard/reports', icon: BarChart });
    }

    if (session?.user?.roles?.includes('administrador')) {
        navigation.push({ name: 'Usuários', href: '/dashboard/users', icon: Users });
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between bg-white p-4 shadow-sm">
                <span className="font-bold text-lg">Protocolo Lisboa</span>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    {isSidebarOpen ? <X /> : <Menu />}
                </button>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={clsx(
                        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
                        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    )}
                >
                    <div className="flex h-16 items-center justify-center border-b px-4">
                        <span className="text-xl font-bold text-indigo-600">Protocolo Lisboa</span>
                    </div>

                    <nav className="mt-4 px-2 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={clsx(
                                        'group flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                                        isActive
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    )}
                                >
                                    <item.icon
                                        className={clsx(
                                            'mr-3 h-5 w-5 flex-shrink-0',
                                            isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                                        )}
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="absolute bottom-0 w-full border-t p-4">
                        <div className="flex items-center mb-4">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                {session?.user?.name?.[0] || 'U'}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700">{session?.user?.name}</p>
                                <p className="text-xs text-gray-500 truncate w-32">{session?.user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="group flex w-full items-center px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
                        >
                            <LogOut className="mr-3 h-5 w-5 text-red-500" />
                            Sair
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 overflow-y-auto h-screen">
                    {children}
                </main>
            </div>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
