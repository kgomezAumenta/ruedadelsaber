import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // DEVELOPMENT MODE: Skip auth in development
    if (process.env.NODE_ENV === 'development') {
        return NextResponse.next();
    }

    // Public routes
    if (pathname === '/' || pathname.endsWith('/login') || pathname.startsWith('/api/auth') || pathname.startsWith('/_next') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // Check token
    if (!token) {
        // Redirect to login if trying to access protected route
        // But we need to know where to redirect. 
        // For admin: /login (but we don't have a global login, maybe just redirect to root)
        // For game: redirect to brand login page if possible, or root.
        return NextResponse.redirect(new URL('/', request.url));
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = payload.rol as string;

        // Admin routes protection
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/admin')) {
            if (role !== 'admin') {
                return NextResponse.redirect(new URL('/', request.url));
            }
        }

        // Game routes protection (setup, game, institutional)
        // Assuming 'promotor' or 'admin' can access
        if (pathname.includes('/setup') || pathname.includes('/game') || pathname.includes('/institutional')) {
            if (!role) {
                return NextResponse.redirect(new URL('/', request.url));
            }
        }

        return NextResponse.next();
    } catch (error) {
        // Invalid token
        return NextResponse.redirect(new URL('/', request.url));
    }
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/admin/:path*',
        '/:path*/:path*/setup',
        '/:path*/:path*/game',
        '/:path*/:path*/institutional',
    ],
};
