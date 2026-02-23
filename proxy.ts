import { NextRequest, NextResponse } from 'next/server'
import { getRouteConfig, isPublicRoute, getDashboardByRole, type UserRole } from '@/app/lib/routeConfig'

const SESSION_COOKIE = 'better-auth.session_token'

async function getSessionUser(req: NextRequest): Promise<{ id: string; role: UserRole } | null> {
  try {
    const cookie = req.cookies.get(SESSION_COOKIE)
    if (!cookie?.value) return null

    const res = await fetch(new URL('/api/auth/get-session', req.url), {
      headers: { cookie: `${SESSION_COOKIE}=${cookie.value}` },
      cache: 'no-store',
    })
    if (!res.ok) return null

    const { user } = await res.json()
    if (!user?.id) return null
    return { id: user.id, role: user.role ?? 'user' }
  } catch {
    return null
  }
}

function redirectWith(base: string | URL, path: string, message: string): NextResponse {
  const url = new URL(path, base)
  url.searchParams.set('unauthorized', message)
  return NextResponse.redirect(url)
}

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl

  if (isPublicRoute(pathname)) return NextResponse.next()

  const user = await getSessionUser(req)

  if (!user) {
    const msg = req.cookies.get(SESSION_COOKIE)?.value
      ? 'Your session has expired. Please sign in again.'
      : 'Please sign in to continue.'
    return redirectWith(req.url, '/', msg)
  }

  const route = getRouteConfig(pathname)
  if (!route || !route.allowedRoles.length || route.allowedRoles.includes(user.role)) {
    return NextResponse.next()
  }

  return redirectWith(
    req.url,
    getDashboardByRole(user.role),
    `You don't have permission to access ${route.label}. This area is restricted to ${route.allowedRoles.join(' or ')} users.`
  )
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}