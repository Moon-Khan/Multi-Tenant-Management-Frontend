import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { Spinner } from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { errorMessage } from '../lib/api'
import { createTenant, register } from '../lib/services'

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function RegisterPage() {
  const { login, isAuthenticated, initializing } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()

  // When true, a brand-new workspace (tenant) is created first, then the user.
  const [createWorkspace, setCreateWorkspace] = useState(true)
  const [tenantName, setTenantName] = useState('')
  const [slug, setSlug] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!initializing && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanSlug = slug.trim().toLowerCase()
    if (!SLUG_RE.test(cleanSlug)) {
      setError('Slug must be lowercase, alphanumeric and hyphen-separated (e.g. "acme-corp").')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)
    try {
      if (createWorkspace) {
        await createTenant(tenantName.trim(), cleanSlug)
      }
      await register(cleanSlug, email.trim(), password)
      // Registration returns a user but no tokens — sign in to start a session.
      await login(cleanSlug, email.trim(), password)
      notify('Account created — welcome to Atlas', 'success')
      navigate('/', { replace: true })
    } catch (err) {
      setError(errorMessage(err, 'Could not create the account'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start a new workspace or join an existing tenant."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
            {error}
          </div>
        )}

        <div className="flex rounded-lg bg-slate-100 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setCreateWorkspace(true)}
            className={`flex-1 rounded-md px-3 py-1.5 transition ${
              createWorkspace
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            New workspace
          </button>
          <button
            type="button"
            onClick={() => setCreateWorkspace(false)}
            className={`flex-1 rounded-md px-3 py-1.5 transition ${
              !createWorkspace
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Join existing
          </button>
        </div>

        {createWorkspace && (
          <div>
            <label htmlFor="tenantName" className="label">
              Workspace name
            </label>
            <input
              id="tenantName"
              className="input"
              placeholder="Acme Corporation"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              required={createWorkspace}
            />
          </div>
        )}

        <div>
          <label htmlFor="slug" className="label">
            Tenant slug
          </label>
          <input
            id="slug"
            className="input"
            placeholder="acme-corp"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-slate-400">
            {createWorkspace
              ? 'Pick a unique identifier for your new workspace.'
              : 'The slug of the tenant you are joining.'}
          </p>
        </div>

        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={submitting}
        >
          {submitting && <Spinner className="h-4 w-4" />}
          {createWorkspace ? 'Create workspace & account' : 'Create account'}
        </button>

        <p className="text-center text-xs text-slate-400">
          New accounts join as a <span className="font-medium">member</span>.
        </p>
      </form>
    </AuthShell>
  )
}
