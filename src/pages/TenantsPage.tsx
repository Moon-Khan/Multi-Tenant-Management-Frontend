import { useEffect, useState, type FormEvent } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Spinner } from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { errorMessage } from '../lib/api'
import { createTenant, listTenants } from '../lib/services'
import type { Tenant } from '../lib/types'

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function TenantsPage() {
  const { user } = useAuth()
  const { notify } = useToast()

  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setError(null)
    try {
      setTenants(await listTenants())
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    const cleanSlug = slug.trim().toLowerCase()
    if (!SLUG_RE.test(cleanSlug)) {
      notify('Slug must be lowercase, alphanumeric and hyphen-separated.', 'error')
      return
    }
    setSubmitting(true)
    try {
      const tenant = await createTenant(name.trim(), cleanSlug)
      setTenants((prev) => [tenant, ...prev])
      setName('')
      setSlug('')
      setShowForm(false)
      notify('Tenant created', 'success')
    } catch (err) {
      notify(errorMessage(err, 'Could not create tenant'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Tenants"
        subtitle="All workspaces registered on this instance."
        actions={
          <button
            className="btn-primary"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? 'Cancel' : '+ New tenant'}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="t-name" className="label">
                Name
              </label>
              <input
                id="t-name"
                className="input"
                placeholder="Acme Corporation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="t-slug" className="label">
                Slug
              </label>
              <input
                id="t-slug"
                className="input"
                placeholder="acme-corp"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting && <Spinner className="h-4 w-4" />}
              Create tenant
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="mb-6 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7 text-brand-600" />
        </div>
      ) : tenants.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl">◱</div>
          <p className="mt-3 font-medium text-slate-700">No tenants yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Create the first workspace above.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Slug</th>
                <th className="px-5 py-3 font-semibold">Plan</th>
                <th className="px-5 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((t) => {
                const isCurrent = t.id === user?.tenantId
                return (
                  <tr key={t.id} className={isCurrent ? 'bg-brand-50/40' : ''}>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {t.name}
                      {isCurrent && (
                        <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">
                      {t.slug}
                    </td>
                    <td className="px-5 py-3 capitalize text-slate-600">
                      {t.plan}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
