import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Login | Rueda del Saber',
    description: 'Ingreso al panel administrativo',
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
