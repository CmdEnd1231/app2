'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { AppShell } from '@/components/app-shell'
import { ProjectCard } from '@/components/project-card'
import { ProjectForm } from '@/components/project-form'
import { Card, Label, Select } from '@/components/ui'
import { createClient } from '@/lib/supabase-browser'
import type { Profile, Project, TimeEntry } from '@/lib/types'
import { formatCurrency, formatHours, getMonthOptions, isEntryInMonth, monthLabel } from '@/lib/utils'

export default function DashboardPage() {
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
      const { data: sessionData } = await supabase.auth.getUser()
      const user = sessionData.user

      if (!user) {
        router.push('/login')
        return
      }

      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      setProfile(currentProfile)

      if (currentProfile.role !== 'admin') {
        router.push('/viewer')
        return
      }

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError
      setProjects(projectsData || [])

      if ((projectsData || []).length) {
        const ids = (projectsData || []).map((item) => item.id)
        const { data: entriesData, error: entriesError } = await supabase
          .from('time_entries')
          .select('*')
          .in('project_id', ids)
          .order('work_date', { ascending: false })

        if (entriesError) throw entriesError
        setEntries(entriesData || [])
      } else {
        setEntries([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nu am putut încărca datele.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredEntries = useMemo(() => {
    if (!selectedMonth) return entries
    return entries.filter((entry) => isEntryInMonth(entry.work_date, selectedMonth))
  }, [entries, selectedMonth])

  const metrics = useMemo(() => {
    const totalHours = filteredEntries.reduce((sum, entry) => sum + Number(entry.hours), 0)
    const totalAmount = projects.reduce((sum, project) => {
      const projectHours = filteredEntries
        .filter((entry) => entry.project_id === project.id && entry.billable)
        .reduce((acc, entry) => acc + Number(entry.hours), 0)
      return sum + projectHours * Number(project.hourly_rate)
    }, 0)

    return { totalHours, totalAmount }
  }, [filteredEntries, projects])

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">Se încarcă dashboardul...</main>
  }

  const currentMonthLabel = monthOptions.find((option) => option.value === selectedMonth)?.label ?? monthLabel()

  return (
    <AppShell
      title="Dashboard"
      subtitle={
        profile?.full_name
          ? `Salut, ${profile.full_name}. Vezi rapid proiectele și totalurile pentru ${currentMonthLabel}.`
          : `Privire de ansamblu pentru ${currentMonthLabel}.`
      }
    >
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
        <p className="text-sm text-slate-500">Totalurile și cardurile proiectelor sunt calculate pe luna selectată.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Ore totale</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{formatHours(metrics.totalHours)}h</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">De încasat</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{formatCurrency(metrics.totalAmount)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Proiecte active</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{projects.filter((p) => p.status === 'active').length}</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-5">
          {projects.length ? (
            projects.map((project) => {
              const hours = filteredEntries
                .filter((entry) => entry.project_id === project.id && entry.billable)
                .reduce((sum, entry) => sum + Number(entry.hours), 0)
              const amount = hours * Number(project.hourly_rate)
              return <ProjectCard key={project.id} project={project} hours={hours} amount={amount} />
            })
          ) : (
            <Card className="p-6 text-sm text-slate-500">Nu ai încă proiecte. Creează primul proiect din panoul din dreapta.</Card>
          )}
        </section>
        <ProjectForm onCreated={loadData} />
      </div>
    </AppShell>
  )
}
