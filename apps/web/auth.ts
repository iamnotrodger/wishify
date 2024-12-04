import { prisma } from '@/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth, { Session } from 'next-auth';
import authConfig from '@/auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
  ...authConfig,
});

export interface AuthenticatedSession extends Session {
  user: {
    id: string;
  };
}

export const isAuthenticated = (
  session: Session | null
): session is AuthenticatedSession => {
  return !!session && !!session.user && typeof session.user.id === 'string';
};
