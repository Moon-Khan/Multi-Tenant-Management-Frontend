// Shapes mirror the NestJS backend presenters and the unified response
// envelope ({ status, msg, data }).

export type UserRole = 'admin' | 'member' | 'viewer'

/** Returned by POST /auth/login (`data.user`) and POST /auth/register. */
export interface AuthUser {
  id: string
  tenantId: string
  email: string
  role: UserRole
}

/** Returned by GET /auth/me — shape of the verified access-token claims. */
export interface CurrentUser {
  userId: string
  tenantId: string
  role: UserRole
  email: string
}

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}

export interface Tenant {
  id: string
  name: string
  slug: string
  plan: string
  createdAt: string
  updatedAt: string
}

export interface TenantNote {
  id: string
  content: string
  createdAt: string
}

/** The envelope every backend route wraps its payload in. */
export interface ApiEnvelope<T> {
  status: number
  msg: string
  data: T
}
