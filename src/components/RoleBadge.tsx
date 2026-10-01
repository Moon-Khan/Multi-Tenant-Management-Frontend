import type { UserRole } from '../lib/types'

const styles: Record<UserRole, string> = {
  admin: 'bg-violet-100 text-violet-700 ring-violet-200',
  member: 'bg-brand-100 text-brand-700 ring-brand-200',
  viewer: 'bg-slate-100 text-slate-600 ring-slate-200',
}

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${styles[role]}`}
    >
      {role}
    </span>
  )
}
