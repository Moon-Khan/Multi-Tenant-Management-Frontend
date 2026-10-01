import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { RoleBadge } from '../components/RoleBadge'
import { Spinner } from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../lib/api'
import { listNotes, listTenants } from '../lib/services'
import type { Tenant } from '../lib/types'

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="card p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const [noteCount, setNoteCount] = useState<number | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [notes, tenants] = await Promise.all([
          listNotes(),
          listTenants().catch(() => [] as Tenant[]),
        ])
        if (cancelled) return
        setNoteCount(notes.length)
        setTenant(tenants.find((t) => t.id === user?.tenantId) ?? null)
      } catch (err) {
        if (!cancelled) setError(errorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.tenantId])

  const canWrite = user?.role === 'admin' || user?.role === 'member'

  return (
    <div>
      <PageHeader
        title={`Welcome${user ? `, ${user.email.split('@')[0]}` : ''}`}
        subtitle="Here's an overview of your tenant workspace."
      />

      {error && (
        <div className="mb-6 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7 text-brand-600" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Notes"
              value={noteCount ?? '—'}
              hint="In this tenant"
            />
            <StatCard
              label="Workspace"
              value={tenant?.name ?? '—'}
              hint={tenant ? `/${tenant.slug}` : 'Unknown'}
            />
            <StatCard
              label="Plan"
              value={tenant?.plan ?? '—'}
              hint="Current subscription"
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-slate-900">
                Your access
              </h2>
              <div className="mt-4 flex items-center gap-3">
                {user && <RoleBadge role={user.role} />}
                <span className="text-sm text-slate-600">
                  {canWrite
                    ? 'You can read and create notes.'
                    : 'You have read-only access.'}
                </span>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Email</dt>
                  <dd className="font-medium text-slate-800">{user?.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Tenant ID</dt>
                  <dd className="font-mono text-xs text-slate-600">
                    {user?.tenantId}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="card p-6">
              <h2 className="text-sm font-semibold text-slate-900">
                Quick actions
              </h2>
              <div className="mt-4 flex flex-col gap-2">
                <Link to="/notes" className="btn-primary justify-start">
                  ✎ {canWrite ? 'Write a note' : 'View notes'}
                </Link>
                <Link to="/tenants" className="btn-secondary justify-start">
                  ◱ Browse tenants
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
