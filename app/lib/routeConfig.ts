export type UserRole = 'tpa' | 'sponsor' | 'user'

export interface RouteConfig {
  pattern: string
  allowedRoles: UserRole[]
  label: string
}

export const PUBLIC_ROUTES: string[] = ['/', '/api/auth']

export const PROTECTED_ROUTES: RouteConfig[] = [
  { pattern: '/tpa-dashboard', allowedRoles: ['tpa', 'user'], label: 'TPA Dashboard' },
  { pattern: '/tpa-dashboard/sponsor-management', allowedRoles: ['tpa', 'user'], label: 'Sponsor Management' },
  { pattern: '/tpa-dashboard/requirement-management', allowedRoles: ['tpa', 'user'], label: 'Requirement Management' },
  { pattern: '/tpa-dashboard/document-review', allowedRoles: ['tpa', 'user'], label: 'Document Review' },
  { pattern: '/sponsor-dashboard', allowedRoles: ['sponsor'], label: 'Sponsor Dashboard' },
  { pattern: '/sponsor-dashboard/document-upload', allowedRoles: ['sponsor'], label: 'Document Upload' },
]

export function getDashboardByRole(role?: UserRole | string | null): string {
  if (role === 'sponsor') return '/sponsor-dashboard'
  if (role === 'tpa' || role === 'user') return '/tpa-dashboard'
  return '/'
}

export function getRouteConfig(pathname: string): RouteConfig | null {
  const matches = PROTECTED_ROUTES.filter(
    (r) => pathname === r.pattern || pathname.startsWith(r.pattern + '/')
  )
  if (!matches.length) return null
  return matches.reduce((best, cur) => (cur.pattern.length > best.pattern.length ? cur : best))
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((p) => pathname === p || pathname.startsWith(p + '/'))
}