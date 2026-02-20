import { createAuthClient } from "better-auth/react"

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
})
