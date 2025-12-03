'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Globe, Users, HelpCircle, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import '../globals.css';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/paises', label: 'Países', icon: Globe },
    { href: '/dashboard/grupos', label: 'Grupos', icon: Globe },
    { href: '/dashboard/marcas', label: 'Marcas', icon: Globe },
    { href: '/dashboard/ubicaciones', label: 'Ubicaciones', icon: Globe },
    { href: '/dashboard/marcas-bayer', label: 'Marcas Bayer', icon: Globe },
    { href: '/dashboard/usuarios', label: 'Usuarios', icon: Users },
    { href: '/dashboard/preguntas', label: 'Preguntas', icon: HelpCircle },
    { href: '/dashboard/reports', label: 'Reportes', icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <html lang="es">
            <body>
                <div className="flex h-screen bg-gray-50">
                    {/* Sidebar */}
                    <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col shadow-xl">
                        <div className="p-6 border-b border-blue-700">
                            <h1 className="text-2xl font-bold">Rueda Admin</h1>
                            <p className="text-blue-200 text-sm mt-1">Panel de Control</p>
                        </div>

                        <nav className="flex-1 px-4 py-6 space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                                            isActive
                                                ? "bg-white text-blue-900 shadow-md font-medium"
                                                : "hover:bg-white/10 text-blue-100 hover:text-white"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t border-blue-700">
                            <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-red-500/20 text-red-300 hover:text-red-100 transition-colors">
                                <LogOut className="w-5 h-5" />
                                Cerrar Sesión
                            </button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto">
                        <div className="p-8">
                            {children}
                        </div>
                    </main>
                </div>
            </body>
        </html>
    );
}
