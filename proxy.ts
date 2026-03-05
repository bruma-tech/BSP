import { NextRequest, NextResponse } from 'next/server'

type UserRole = 'tpa' | 'sponsor' | 'user'

interface RouteConfig {
  pattern: string
  allowedRoles: UserRole[]
}

const SESSION_COOKIE = 'better-auth.session_token'

const PUBLIC_ROUTES = ['/', '/api/auth']

const PROTECTED_ROUTES: RouteConfig[] = [
  { pattern: '/tpa-dashboard', allowedRoles: ['tpa', 'user'] },
  { pattern: '/tpa-dashboard/sponsor-management', allowedRoles: ['tpa', 'user'] },
  { pattern: '/tpa-dashboard/requirement-management', allowedRoles: ['tpa', 'user'] },
  { pattern: '/tpa-dashboard/document-review', allowedRoles: ['tpa', 'user'] },
  { pattern: '/sponsor-dashboard', allowedRoles: ['sponsor'] },
  { pattern: '/sponsor-dashboard/document-upload', allowedRoles: ['sponsor'] },
]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

function getRouteConfig(pathname: string): RouteConfig | null {
  const matches = PROTECTED_ROUTES.filter(
    (r) => pathname === r.pattern || pathname.startsWith(r.pattern + '/')
  )
  if (!matches.length) return null
  return matches.reduce((best, cur) => (cur.pattern.length > best.pattern.length ? cur : best))
}

function getDashboardByRole(role: UserRole | string): string {
  if (role === 'sponsor') return '/sponsor-dashboard'
  if (role === 'tpa' || role === 'user') return '/tpa-dashboard'
  return '/'
}

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
  if (!user) return NextResponse.redirect(new URL('/', req.url))

  const route = getRouteConfig(pathname)
  if (!route || !route.allowedRoles.length || route.allowedRoles.includes(user.role)) {
    return NextResponse.next()
  }

  return redirectWith(
    req.url,
    getDashboardByRole(user.role),
    `You don't have permission to access this page.`
  )
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}