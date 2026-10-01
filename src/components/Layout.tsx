import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { RoleBadge } from './RoleBadge'

const nav = [
  { to: '/', label: 'Dashboard', icon: '▣', end: true },
  { to: '/notes', label: 'Notes', icon: '✎', end: false },
  { to: '/tenants', label: 'Tenants', icon: '◱', end: false },
]

export function Layout() {
  const { user, logout } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    notify('Signed out', 'info')
    navigate('/login', { replace: true })
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white">
          A
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-slate-900">Atlas</p>
          <p className="text-xs text-slate-500">Tenant Console</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              ].join(' ')
            }
          >
            <span className="w-5 text-center text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        {user && (
          <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-slate-800">
                {user.email}
              </p>
              <RoleBadge role={user.role} />
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-400">
              Tenant {user.tenantId.slice(0, 8)}…
            </p>
          </div>
        )}
        <button onClick={handleLogout} className="btn-secondary w-full">
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            A
          </div>
          <span className="font-bold text-slate-900">Atlas</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="btn-secondary px-3 py-1.5"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-30 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl">
            {SidebarContent}
          </aside>
        </div>
      )}

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
