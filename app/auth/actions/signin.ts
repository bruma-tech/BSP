'use server'
import { SigninFormSchema } from '../schemas/signin'
import type { FormState } from '../types'
import { auth } from '../config/server'
import { getDashboardUrlByRole } from '@/app/lib/dal'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'


export async function signin(state: FormState, formData: FormData): Promise<FormState> {
  // Validate form fields
  const validatedFields = SigninFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role')
  })

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  let callbackURL = '/'

  try {
    const response = await auth.api.signInEmail({
      body: {
        email: validatedFields.data.email,
        password: validatedFields.data.password,
      },
      headers: await headers(),
    })

    // Use DAL to determine redirect URL based on user role
    const user = response.user as { role?: string } | undefined
    const userRole = user?.role
    callbackURL = getDashboardUrlByRole(userRole)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Sign in failed',
    }
  }

  // redirect() throws internally in Next.js, so keep it outside try-catch
  redirect(callbackURL)
}
