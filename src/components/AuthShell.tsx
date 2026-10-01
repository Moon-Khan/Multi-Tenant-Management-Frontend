import type { ReactNode } from 'react'

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-xl font-bold">
            A
          </div>
          <span className="text-lg font-bold">Atlas</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Multi-tenant management,
            <br />
            built for isolation.
          </h2>
          <p className="mt-4 max-w-md text-brand-100">
            Tenant-scoped data with PostgreSQL row-level security, JWT auth with
            refresh rotation, and role-based access control — admin, member and
            viewer.
          </p>
        </div>
        <ul className="space-y-2 text-sm text-brand-100">
          <li>✓ Per-tenant data isolation</li>
          <li>✓ Role-based access control</li>
          <li>✓ Secure refresh-token sessions</li>
        </ul>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white">
              A
            </div>
            <span className="text-lg font-bold text-slate-900">Atlas</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-sm text-slate-500">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
