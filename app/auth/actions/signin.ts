import { SigninFormSchema } from '../schemas/signin'
import type { FormState } from '../types'
import { authClient } from '../config/client'

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

  const { data, error } = await authClient.signIn.email({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  // Determine callbackURL based on user role from signIn response
  let callbackURL = '/'
  if (data?.user) {
    const user = data.user as { role?: string }
    const userRole = user?.role
    if (userRole === 'tpa' || userRole === 'user') {
      callbackURL = '/tpa-dashboard'
    } else if (userRole === 'sponsor') {
      callbackURL = '/sponsor-dashboard'
    }
  }

  return {
    data: data,
    redirectTo: callbackURL,
  }
}
