import { SigninFormSchema } from './schemas/signin'

export type FormState =
  | {
      errors?: {
        email?: string[]
        password?: string[]
        role?: string[]
      }
      error?: string
      message?: string
      data?: unknown
      redirectTo?: string
    }
  | undefined

export type { SigninFormData } from './schemas/signin'
