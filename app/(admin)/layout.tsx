import AdminSidebar from '@/components/Admin/AdminSidebar';
import '../globals.css';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body suppressHydrationWarning>
                <div className="flex h-screen bg-gray-50 overflow-hidden">
                    <AdminSidebar />

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
