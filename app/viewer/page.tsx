'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { AppShell } from '@/components/app-shell'
import { Badge, Card, Label, Select } from '@/components/ui'
import { createClient } from '@/lib/supabase-browser'
import type { Profile, Project, TimeEntry } from '@/lib/types'
import { formatCurrency, formatDate, formatHours, getMonthOptions, isEntryInMonth, statusLabel } from '@/lib/utils'

export default function ViewerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const monthOptions = getMonthOptions()
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]?.value ?? '')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: authData } = await supabase.auth.getUser()
      const user = authData.user

      if (!user) {
        router.push('/login')
        return
      }

      const { data: currentProfile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profileError) throw profileError
      setProfile(currentProfile)

      if (currentProfile.role === 'admin') {
        router.push('/dashboard')
        return
      }

      const { data: mappings, error: mappingsError } = await supabase
        .from('project_viewers')
        .select('project_id')
        .eq('viewer_user_id', user.id)
      if (mappingsError) throw mappingsError

      const projectIds = (mappings || []).map((item) => item.project_id)
      if (!projectIds.length) {
        setProjects([])
        setEntries([])
        return
      }

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .in('id', projectIds)
        .order('created_at', { ascending: false })
      if (projectsError) throw projectsError
      setProjects(projectsData || [])

      const { data: entriesData, error: entriesError } = await supabase
        .from('time_entries')
        .select('*')
        .in('project_id', projectIds)
        .order('work_date', { ascending: false })
      if (entriesError) throw entriesError
      setEntries(entriesData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nu am putut încărca portalul clientului.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const grouped = useMemo(() => {
    return projects.map((project) => {
      const projectEntries = entries.filter(
        (entry) => entry.project_id === project.id && entry.billable && isEntryInMonth(entry.work_date, selectedMonth),
      )
      const totalHours = projectEntries.reduce((sum, entry) => sum + Number(entry.hours), 0)
      const totalAmount = totalHours * Number(project.hourly_rate)
      return { project, entries: projectEntries, totalHours, totalAmount }
    })
  }, [entries, projects, selectedMonth])

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">Se încarcă portalul clientului...</main>
  }

  return (
    <AppShell title="Portal client" subtitle={profile?.full_name ? `Bun venit, ${profile.full_name}.` : 'Vizualizare proiecte alocate.'}>
      {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Label>Luna afișată</Label>
          <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="min-w-[220px]">
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <p className="text-sm text-slate-500">Clientul vede doar proiectele alocate și totalurile pentru luna selectată.</p>
      </div>

      {!grouped.length ? (
        <Card className="p-6 text-sm text-slate-500">Nu ai încă proiecte alocate pentru vizualizare.</Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ project, entries: projectEntries, totalAmount, totalHours }) => (
            <Card key={project.id} className="overflow-hidden p-0">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-slate-950">{project.name}</h3>
                    <Badge>{statusLabel(project.status)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Client: {project.client_name}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Ore totale</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">{formatHours(totalHours)}h</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Total de plată</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">{formatCurrency(totalAmount, project.currency)}</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {projectEntries.length ? (
                  projectEntries.map((entry) => (
                    <div key={entry.id} className="grid gap-3 px-6 py-4 md:grid-cols-[140px_90px_140px_1fr]">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Data</p>
                        <p className="mt-1 text-sm font-medium text-slate-800">{formatDate(entry.work_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Ore</p>
                        <p className="mt-1 text-sm font-medium text-slate-800">{formatHours(entry.hours)}h</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Categorie</p>
                        <p className="mt-1 text-sm font-medium text-slate-800">{entry.category || 'general'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Observații</p>
                        <p className="mt-1 text-sm text-slate-600">{entry.notes || '—'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-sm text-slate-500">Nu există încă intrări înregistrate pentru luna selectată.</div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  )
}
