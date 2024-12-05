import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

export default {
  providers: [Google],
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig;
