import { api } from './api'
import type {
  ApiEnvelope,
  AuthUser,
  CurrentUser,
  LoginResponse,
  Tenant,
  TenantNote,
} from './types'

const TENANT_HEADER = 'x-tenant-slug'

function unwrap<T>(res: { data: ApiEnvelope<T> }): T {
  return res.data.data
}

// ---- Auth ----------------------------------------------------------------

export async function login(
  tenantSlug: string,
  email: string,
  password: string,
): Promise<LoginResponse> {
  const res = await api.post<ApiEnvelope<LoginResponse>>(
    '/auth/login',
    { email, password },
    { headers: { [TENANT_HEADER]: tenantSlug } },
  )
  return unwrap(res)
}

export async function register(
  tenantSlug: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  const res = await api.post<ApiEnvelope<AuthUser>>(
    '/auth/register',
    { email, password },
    { headers: { [TENANT_HEADER]: tenantSlug } },
  )
  return unwrap(res)
}

export async function refresh(): Promise<string> {
  const res = await api.post<ApiEnvelope<{ accessToken: string }>>(
    '/auth/refresh',
    {},
  )
  return unwrap(res).accessToken
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout', {})
}

export async function me(): Promise<CurrentUser> {
  const res = await api.get<ApiEnvelope<CurrentUser>>('/auth/me')
  return unwrap(res)
}

// ---- Tenants -------------------------------------------------------------

export async function listTenants(): Promise<Tenant[]> {
  const res = await api.get<ApiEnvelope<Tenant[]>>('/tenants')
  return unwrap(res)
}

export async function createTenant(name: string, slug: string): Promise<Tenant> {
  const res = await api.post<ApiEnvelope<Tenant>>('/tenants', { name, slug })
  return unwrap(res)
}

// ---- Tenant notes --------------------------------------------------------

export async function listNotes(): Promise<TenantNote[]> {
  const res = await api.get<ApiEnvelope<TenantNote[]>>('/tenant-notes')
  return unwrap(res)
}

export async function createNote(content: string): Promise<TenantNote> {
  const res = await api.post<ApiEnvelope<TenantNote>>('/tenant-notes', {
    content,
  })
  return unwrap(res)
}
