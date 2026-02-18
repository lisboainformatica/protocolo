
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    // Public paths
    if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/api/auth')) {
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        return NextResponse.next();
    }

    // Protected paths
    if (!token) {
        const url = new URL('/login', req.url);
        url.searchParams.set('callbackUrl', encodeURI(req.url));
        return NextResponse.redirect(url);
    }

    // RBAC for Admin routes
    if (pathname.startsWith('/admin') && !token.roles?.includes('administrador')) {
        // Redirect to unauthorized or dashboard
        return NextResponse.redirect(new URL('/dashboard', req.url)); // Or 403 page
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/protocols/:path*',
        '/workflows/:path*',
        '/login',
        '/register',
    ],
};
