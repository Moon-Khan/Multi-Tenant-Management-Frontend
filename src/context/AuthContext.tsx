import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { onAuthExpired, setAccessToken } from '../lib/api'
import * as auth from '../lib/services'
import type { AuthUser, UserRole } from '../lib/types'

interface SessionUser {
  id: string
  email: string
  role: UserRole
  tenantId: string
}

interface AuthContextValue {
  user: SessionUser | null
  tenantSlug: string | null
  /** True only during the initial "restore session from cookie" check. */
  initializing: boolean
  isAuthenticated: boolean
  login: (tenantSlug: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Non-sensitive UX hints (which tenant / which user the tab last used) so the
// UI can render immediately on reload while the real session is restored from
// the httpOnly refresh cookie. No tokens are stored here.
const TENANT_SLUG_KEY = 'atlas.tenantSlug'

function toSessionUser(u: AuthUser): SessionUser {
  return { id: u.id, email: u.email, role: u.role, tenantId: u.tenantId }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [tenantSlug, setTenantSlug] = useState<string | null>(() =>
    localStorage.getItem(TENANT_SLUG_KEY),
  )
  const [initializing, setInitializing] = useState(true)

  const clearSession = useCallback(() => {
    setAccessToken(null)
    setUser(null)
  }, [])

  // On mount, try to restore a session: the refresh cookie (if present and
  // valid) yields a fresh access token, then /auth/me gives us the user.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const token = await auth.refresh()
        setAccessToken(token)
        const current = await auth.me()
        if (!cancelled) {
          setUser({
            id: current.userId,
            email: current.email,
            role: current.role,
            tenantId: current.tenantId,
          })
        }
      } catch {
        if (!cancelled) clearSession()
      } finally {
        if (!cancelled) setInitializing(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [clearSession])

  // If a later refresh fails mid-session, the api layer fires this event.
  useEffect(() => onAuthExpired(() => clearSession()), [clearSession])

  const login = useCallback(
    async (slug: string, email: string, password: string) => {
      const { accessToken, user: authUser } = await auth.login(
        slug,
        email,
        password,
      )
      setAccessToken(accessToken)
      setUser(toSessionUser(authUser))
      setTenantSlug(slug)
      localStorage.setItem(TENANT_SLUG_KEY, slug)
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await auth.logout()
    } catch {
      // Even if the server call fails, drop the local session.
    } finally {
      clearSession()
    }
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tenantSlug,
      initializing,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, tenantSlug, initializing, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
