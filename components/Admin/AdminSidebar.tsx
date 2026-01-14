'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Globe, Users, HelpCircle, LogOut, ShoppingBag, MapPin, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Reportes', icon: LayoutDashboard, href: '/dashboard/reports' },
    { label: 'Paises', icon: Globe, href: '/dashboard/paises' },
    { label: 'Puntos de Venta', icon: ShoppingBag, href: '/dashboard/puntos-venta' },
    { label: 'Ubicaciones', icon: MapPin, href: '/dashboard/ubicaciones' },
    { label: 'Marcas Bayer', icon: Award, href: '/dashboard/marcas-bayer' },
    { label: 'Preguntas', icon: HelpCircle, href: '/dashboard/preguntas' },
    { label: 'Usuarios', icon: Users, href: '/dashboard/usuarios' },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                router.push('/login');
                router.refresh();
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col shadow-xl shrink-0">
            <div className="p-6 border-b border-blue-700">
                <h1 className="text-2xl font-bold italic">Rueda Admin</h1>
                <p className="text-blue-200 text-sm mt-1">Panel de Control</p>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-red-500/20 text-red-300 hover:text-red-100 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}
