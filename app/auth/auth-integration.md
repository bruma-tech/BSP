# JIRA: Better-Auth Integration – Change Description

## Summary
Integrated **better-auth** for authentication in the Bruma portal. Implemented email/password sign-in with role-based redirects (TPA vs Sponsor) and restructured all auth-related code under a single, maintainable `app/auth` module.

---

## What Was Done

### 1. Authentication library
- **better-auth** is used for auth (sessions, sign-in, database adapter).
- **Email/password** sign-in is enabled and wired to the login form.
- **Session handling**: cookie-based sessions with optional cookie cache (compact strategy, 5 min max age) for performance.

### 2. Database integration
- **Prisma** is the data layer; better-auth uses the Prisma adapter with PostgreSQL.
- **Migrations** add/align models required by better-auth:
  - **User**: id, name, email, emailVerified, image, createdAt, updatedAt, **role** (tpa | sponsor | user), plus relations to Session and Account.
  - **Session**: id, expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId.
  - **Account**: id, accountId, providerId, userId, tokens, password (for email/password), timestamps.
  - **Verification**: for email verification / password reset flows (if used later).
- **Custom field**: `User.role` is required, default `"user"`, with allowed values: `tpa`, `sponsor`, `user`.

### 3. Next.js integration
- **API route** `app/api/auth/[...all]/route.ts` delegates all better-auth HTTP endpoints (sign-in, sign-out, session, etc.) via `toNextJsHandler(auth)`.
- **Server config** lives in `app/auth/config/server.ts` (better-auth instance with Prisma adapter, email/password, trusted origins).
- **Client config** in `app/auth/config/client.ts` (better-auth React client for browser and server actions).
- **Server action** `app/auth/actions/signin.ts`:
  - Validates email/password (and optional role) with Zod.
  - Calls better-auth sign-in (email/password).
  - Returns role-based redirect: TPA/user → `/tpa-dashboard`, Sponsor → `/sponsor-dashboard`.

### 4. Login flow and UI
- **Login page** uses existing login form component.
- **Form**: email, password, and “Login as” (TPA / Sponsor) selector; form submits to the sign-in server action.
- **Validation**: Zod schema for email, password (length, letter, number, special char), and role.
- **Post-login**: Redirect to the correct dashboard based on `User.role` (no reliance on “Login as” for security; role is from DB).

### 5. Code structure (maintainability)
Auth logic is centralized under **`app/auth/`**:

| Area        | Location                      | Purpose |
|------------|-------------------------------|--------|
| Server config | `app/auth/config/server.ts`   | better-auth server instance, Prisma adapter, session, email/password |
| Client config | `app/auth/config/client.ts`   | better-auth React client (base URL, etc.) |
| Schemas     | `app/auth/schemas/signin.ts`  | Zod sign-in validation and types |
| Actions     | `app/auth/actions/signin.ts`  | Sign-in server action and role-based redirect |
| Types       | `app/auth/types.ts`           | Shared auth types (e.g. FormState) |
| Barrel      | `app/auth/index.ts`           | Re-exports for `@/app/auth` |

- **API**: `app/api/auth/[...all]/route.ts` — catch-all for better-auth.
- **UI**: `app/components/auth/` — login form and login-type slider (unchanged in behavior, updated imports).

Old scattered auth pieces (`app/lib/auth.ts`, `app/lib/auth-client.ts`, `app/actions/auth.ts`, `app/lib/definitions.ts`) were removed or replaced by the new structure.

---

## Technical Details

- **Stack**: Next.js (App Router), better-auth, Prisma, PostgreSQL, Zod.
- **Session**: Cookie-based; optional cookie cache for fewer DB hits.
- **Roles**: Stored on `User.role`; redirect logic in sign-in action.
- **Trusted origins**: Configured (e.g. `http://localhost:3000`); add production URL when deploying.

---

## Out of Scope / Follow-ups (optional for JIRA)

- Sign-up and password reset flows (DB/Verification model ready; UI and flows not implemented).
- Protecting dashboard routes with middleware (e.g. redirect unauthenticated users to login).
- Using `User.role` in middleware or RLS for authorization.

---

## How to Use in JIRA

Copy the sections you need (e.g. Summary + What Was Done + Technical Details) into the ticket description. Use “Summary” as the first paragraph and “What Was Done” as the main body; add “Out of Scope” only if you track follow-up work.
