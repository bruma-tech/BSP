import 'server-only'
import { headers } from 'next/headers'
import { auth } from '@/app/auth/config/server'

/**
 * Data Access Layer (DAL) for Authentication & Authorization
 * 
 * This layer provides session verification and user authorization logic
 * that can be used across the application.
 */

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role: 'tpa' | 'sponsor' | 'user'
  emailVerified: boolean
  image?: string | null
}

export interface SessionVerificationResult {
  isAuthenticated: boolean
  user: AuthenticatedUser | null
  session: unknown | null
  error?: string
}

/**
 * Verify the current user's session
 * Use this in server components, server actions, or API routes
 * 
 * @returns SessionVerificationResult with authentication status and user info
 * 
 * @example
 * ```ts
 * const { isAuthenticated, user } = await verifySession()
 * if (!isAuthenticated) {
 *   redirect('/')
 * }
 * ```
 */
export async function verifySession(): Promise<SessionVerificationResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      return {
        isAuthenticated: false,
        user: null,
        session: null,
      }
    }

    const user: AuthenticatedUser = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: (session.user.role as 'tpa' | 'sponsor' | 'user') || 'user',
      emailVerified: session.user.emailVerified ?? false,
      image: session.user.image ?? null,
    }

    return {
      isAuthenticated: true,
      user,
      session: session as unknown,
    }
  } catch (error) {
    console.error('Session verification error:', error)
    return {
      isAuthenticated: false,
      user: null,
      session: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get the current authenticated user
 * Throws an error if user is not authenticated
 * 
 * @returns AuthenticatedUser
 * @throws Error if user is not authenticated
 * 
 * @example
 * ```ts
 * try {
 *   const user = await getAuthenticatedUser()
 *   console.log(user.role)
 * } catch (error) {
 *   redirect('/')
 * }
 * ```
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const result = await verifySession()
  
  if (!result.isAuthenticated || !result.user) {
    throw new Error('User is not authenticated')
  }
  
  return result.user
}

/**
 * Check if the current user has a specific role
 * 
 * @param role - The role to check for
 * @returns boolean indicating if user has the role
 * 
 * @example
 * ```ts
 * const isTPA = await hasRole('tpa')
 * if (isTPA) {
 *   // TPA-specific logic
 * }
 * ```
 */
export async function hasRole(role: 'tpa' | 'sponsor' | 'user'): Promise<boolean> {
  const result = await verifySession()
  return result.user?.role === role
}

/**
 * Check if the current user is authorized for TPA dashboard
 * (TPA role or user role)
 * 
 * @returns boolean
 */
export async function isTPAAuthorized(): Promise<boolean> {
  const result = await verifySession()
  return result.user?.role === 'tpa' || result.user?.role === 'user'
}

/**
 * Check if the current user is authorized for Sponsor dashboard
 * 
 * @returns boolean
 */
export async function isSponsorAuthorized(): Promise<boolean> {
  const result = await verifySession()
  return result.user?.role === 'sponsor'
}

/**
 * Get the appropriate dashboard URL based on user role
 * 
 * @returns Dashboard URL path or null if user is not authenticated
 * 
 * @example
 * ```ts
 * const dashboardUrl = await getDashboardUrl()
 * if (dashboardUrl) {
 *   redirect(dashboardUrl)
 * }
 * ```
 */
export async function getDashboardUrl(): Promise<string | null> {
  const result = await verifySession()
  
  if (!result.isAuthenticated || !result.user) {
    return null
  }

  const role = result.user.role

  switch (role) {
    case 'tpa':
    case 'user':
      return '/tpa-dashboard'
    case 'sponsor':
      return '/sponsor-dashboard'
    default:
      return '/'
  }
}

/**
 * Verify session and get dashboard URL in one call
 * Useful for post-login redirects
 * 
 * @param userRole - Optional user role from sign-in response
 * @returns Dashboard URL based on role
 * 
 * @example
 * ```ts
 * // After successful sign-in
 * const redirectUrl = getDashboardUrlByRole(user.role)
 * redirect(redirectUrl)
 * ```
 */
export function getDashboardUrlByRole(userRole?: string): string {
  if (!userRole) {
    return '/'
  }

  switch (userRole) {
    case 'tpa':
    case 'user':
      return '/tpa-dashboard'
    case 'sponsor':
      return '/sponsor-dashboard'
    default:
      return '/'
  }
}
