# Data Access Layer (DAL) for Authentication & Authorization

## Overview

The DAL (`app/lib/dal.ts`) provides a centralized layer for session verification and user authorization. It abstracts away the complexity of better-auth session management and provides clean, reusable functions for checking authentication status and user roles.

## Key Functions

### `verifySession()`
Verifies the current user's session and returns authentication status.

```typescript
const { isAuthenticated, user, session } = await verifySession()
if (!isAuthenticated) {
  redirect('/')
}
```

### `getAuthenticatedUser()`
Gets the authenticated user, throws error if not authenticated.

```typescript
try {
  const user = await getAuthenticatedUser()
  console.log(user.role) // 'tpa' | 'sponsor' | 'user'
} catch (error) {
  redirect('/')
}
```

### `hasRole(role)`
Checks if the current user has a specific role.

```typescript
const isTPA = await hasRole('tpa')
if (isTPA) {
  // TPA-specific logic
}
```

### `isTPAAuthorized()` / `isSponsorAuthorized()`
Convenience functions to check dashboard access.

```typescript
const canAccessTPA = await isTPAAuthorized()
const canAccessSponsor = await isSponsorAuthorized()
```

### `getDashboardUrl()`
Gets the appropriate dashboard URL based on user role.

```typescript
const dashboardUrl = await getDashboardUrl()
if (dashboardUrl) {
  redirect(dashboardUrl)
}
```

### `getDashboardUrlByRole(userRole)`
Static function to get dashboard URL from a role string (useful for post-login redirects).

```typescript
const redirectUrl = getDashboardUrlByRole('tpa') // Returns '/tpa-dashboard'
```

## Integration with Login Form

The login form (`app/components/auth/login-form.tsx`) uses the DAL indirectly through the `signin` server action:

1. **User submits login form** → calls `signin` server action
2. **Signin action validates credentials** → uses better-auth to authenticate
3. **Signin action uses DAL** → calls `getDashboardUrlByRole()` to determine redirect URL
4. **Signin action returns** → includes `redirectTo` in the response
5. **Login form receives response** → `useEffect` hook detects `redirectTo` and navigates

### Flow Diagram

```
Login Form (Client)
    ↓
signin() Server Action
    ↓
better-auth signIn.email()
    ↓
getDashboardUrlByRole() from DAL
    ↓
Returns redirectTo: '/tpa-dashboard' or '/sponsor-dashboard'
    ↓
Login Form useEffect detects redirectTo
    ↓
router.push(redirectTo)
```

## Role-Based Redirects

The DAL implements the following redirect logic:

- **`tpa` role** → `/tpa-dashboard`
- **`user` role** → `/tpa-dashboard` (treated same as TPA)
- **`sponsor` role** → `/sponsor-dashboard`
- **No role / unauthenticated** → `/` (login page)

## Usage Examples

### In Server Components

```tsx
import { verifySession, getDashboardUrl } from '@/app/lib/dal'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const { isAuthenticated, user } = await verifySession()
  
  if (!isAuthenticated) {
    redirect('/')
  }
  
  return <div>Welcome {user?.name} ({user?.role})</div>
}
```

### In Server Actions

```tsx
'use server'
import { getAuthenticatedUser, hasRole } from '@/app/lib/dal'

export async function myServerAction() {
  try {
    const user = await getAuthenticatedUser()
    
    if (await hasRole('tpa')) {
      // TPA-only logic
    }
    
    return { success: true }
  } catch (error) {
    return { error: 'Not authenticated' }
  }
}
```

### In API Routes

```tsx
import { verifySession } from '@/app/lib/dal'
import { NextResponse } from 'next/server'

export async function GET() {
  const { isAuthenticated, user } = await verifySession()
  
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  return NextResponse.json({ user })
}
```

## Benefits

✅ **Centralized Logic** - All session verification in one place  
✅ **Type Safety** - Strong TypeScript types for user and session data  
✅ **Reusable** - Use across server components, actions, and API routes  
✅ **Consistent** - Same authorization logic everywhere  
✅ **Maintainable** - Easy to update redirect logic or add new roles  

## Notes

- The DAL uses `auth.api.getSession()` from better-auth under the hood
- Sessions are automatically managed via cookies (handled by better-auth)
- The DAL is server-side only (uses `headers()` from Next.js)
- For client-side session access, use `authClient.getSession()` directly
