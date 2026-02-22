'use server'

import { auth } from '../config/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signout() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    })
  } catch (e) {
    console.log("Logout error:", e)
  }

  redirect('/')
}