import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Rueda del Saber',
    description: 'Juego interactivo de Bayer',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className={`${inter.className} min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white`}>
                <main className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
                    {children}
                </main>
            </body>
        </html>
    );
}
