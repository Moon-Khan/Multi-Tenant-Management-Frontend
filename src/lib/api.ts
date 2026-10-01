import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { ApiEnvelope } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

/**
 * The access token lives in memory only (never localStorage) — the refresh
 * token is an httpOnly cookie the browser manages, so a page reload restores
 * the session via POST /auth/refresh rather than by persisting the access
 * token where scripts could read it.
 */
let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

/**
 * Fired when the session can no longer be recovered (refresh failed). The
 * AuthProvider listens for this to drop the user back to the login screen.
 */
export const AUTH_EXPIRED_EVENT = 'auth:expired'
export function onAuthExpired(handler: () => void): () => void {
  window.addEventListener(AUTH_EXPIRED_EVENT, handler)
  return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handler)
}

export const api = axios.create({
  baseURL: API_URL,
  // Send/receive the httpOnly refresh cookie (scoped to /auth on the backend).
  withCredentials: true,
})

// Attach the current access token to every request.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean }

// Single-flight refresh: concurrent 401s share one refresh call.
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<ApiEnvelope<{ accessToken: string }>>(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      )
      .then((res) => res.data.data.accessToken)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status
    const url = original?.url ?? ''

    const isAuthRoute =
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/register')

    if (status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true
      try {
        const token = await refreshAccessToken()
        setAccessToken(token)
        original.headers = {
          ...original.headers,
          Authorization: `Bearer ${token}`,
        }
        return api(original)
      } catch {
        setAccessToken(null)
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
      }
    }

    return Promise.reject(error)
  },
)

/** Pulls the human-readable message out of the backend's error envelope. */
export function errorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { msg?: string; message?: string | string[] }
      | undefined
    if (data?.msg) return data.msg
    if (Array.isArray(data?.message)) return data.message.join(', ')
    if (typeof data?.message === 'string') return data.message
    if (err.message) return err.message
  }
  if (err instanceof Error) return err.message
  return fallback
}
