import { safeAsync } from '@/lib/utils';
import { prisma } from '@/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth, { DefaultSession, Session } from 'next-auth';
import Google from 'next-auth/providers/google';

declare module 'next-auth' {
  interface Session {
    user: { id: string } & DefaultSession['user'];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
  events: {
    createUser: async (message) => {
      const { user } = message;
      const [, error] = await safeAsync(
        prisma.category.createMany({
          data: [
            { name: 'Clothes', icon: 'shirt', userId: user.id! },
            { name: 'Electronics', icon: 'smartphone', userId: user.id! },
            { name: 'Furniture', icon: 'sofa', userId: user.id! },
          ],
        })
      );

      if (error) console.log(error);
    },
  },
});

export type AuthenticatedSession = Session;

export const isAuthenticated = (
  session: Session | null
): session is AuthenticatedSession => {
  return typeof session?.user?.id === 'string';
};
