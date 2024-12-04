import authConfig from '@/auth.config';
import { safeAsync } from '@/lib/utils';
import { prisma } from '@/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth, { Session } from 'next-auth';

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
