import { SigninFormSchema, FormState } from '@/app/lib/definitions'
import { authClient } from '@/app/lib/auth-client'


export async function signin(state: FormState, formData: FormData) {
  // Validate form fields
  const validatedFields = SigninFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const {data, error} = await authClient.signIn.email({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
    // TODO: change to dynamic callbackURL based on user role
    callbackURL: '/tpa-dashboard',
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  return {
    data: data,
  }
}
