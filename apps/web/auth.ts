import { safeAsync } from '@/lib/utils';
import { prisma } from '@repo/db';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { headers } from 'next/headers';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const [, error] = await safeAsync(
            prisma.category.createMany({
              data: [
                { name: 'Clothes', icon: 'shirt', userId: user.id },
                { name: 'Electronics', icon: 'smartphone', userId: user.id },
                { name: 'Furniture', icon: 'sofa', userId: user.id },
              ],
            })
          );

          if (error) console.log(error);
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type AuthenticatedSession = typeof auth.$Infer.Session;

export const getSession = async (requestHeaders?: Headers) =>
  auth.api.getSession({ headers: requestHeaders ?? (await headers()) });

export const isAuthenticated = (
  session: AuthenticatedSession | null
): session is AuthenticatedSession => !!session;
