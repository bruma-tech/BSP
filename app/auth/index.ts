// Main auth exports for easier imports
export { auth } from './config/server'
export { authClient } from './config/client'
export { SigninFormSchema, type SigninFormData } from './schemas/signin'
export { signin } from './actions/signin'
export type { FormState } from './types'
