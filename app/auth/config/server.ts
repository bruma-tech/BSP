import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import prisma from '@/app/lib/prisma'

export const auth = betterAuth({
  session :{
    cookieCache: {
      enabled: true,
      maxAge: 5*60,
      strategy: "compact"
    }
  },
  user: {
    additionalFields: {
      role: {
        type: ['tpa', 'sponsor', 'user'],
        required: true,
        defaultValue: 'user',
        input: false
      }
    },
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ['http://localhost:3000'],
  plugins: [
    nextCookies()
  ]
})
