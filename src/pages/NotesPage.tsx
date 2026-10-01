import { useEffect, useState, type FormEvent } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Spinner } from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { errorMessage } from '../lib/api'
import { createNote, listNotes } from '../lib/services'
import type { TenantNote } from '../lib/types'

const MAX_LEN = 2000

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function NotesPage() {
  const { user } = useAuth()
  const { notify } = useToast()
  const canWrite = user?.role === 'admin' || user?.role === 'member'

  const [notes, setNotes] = useState<TenantNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setError(null)
    try {
      setNotes(await listNotes())
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
    const trimmed = content.trim()
    if (!trimmed) return
    setSubmitting(true)
    try {
      const note = await createNote(trimmed)
      setNotes((prev) => [note, ...prev])
      setContent('')
      notify('Note created', 'success')
    } catch (err) {
      notify(errorMessage(err, 'Could not create note'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Notes"
        subtitle="Tenant-scoped notes. Isolated per workspace by row-level security."
      />

      {canWrite ? (
        <form onSubmit={handleCreate} className="card mb-6 p-5">
          <label htmlFor="note" className="label">
            New note
          </label>
          <textarea
            id="note"
            className="input min-h-[96px] resize-y"
            placeholder="Write something for your team…"
            maxLength={MAX_LEN}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {content.length}/{MAX_LEN}
            </span>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !content.trim()}
            >
              {submitting && <Spinner className="h-4 w-4" />}
              Add note
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-inset ring-amber-200">
          You have <span className="font-semibold">viewer</span> access — notes
          are read-only for your role.
        </div>
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
      ) : notes.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl">✎</div>
          <p className="mt-3 font-medium text-slate-700">No notes yet</p>
          <p className="mt-1 text-sm text-slate-400">
            {canWrite
              ? 'Create the first note above.'
              : 'Nothing has been written in this tenant yet.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="card p-4">
              <p className="whitespace-pre-wrap text-sm text-slate-800">
                {note.content}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {formatDate(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
