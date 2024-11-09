import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { auth } from '@/auth';
import { NextRequest } from 'next/server';

const { auth: authDefaultMiddleware } = NextAuth(authConfig);

export default async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    const session = await auth();
    if (!session) {
      return Response.json(
        { success: false, message: 'authentication failed' },
        { status: 401 }
      );
    }
  }
  authDefaultMiddleware();
}

export const config = {
  matcher: ['/app/:path*', '/api/:path((?!auth).*)'],
};
