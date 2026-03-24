'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { AppShell } from '@/components/app-shell'
import { TimeEntryForm } from '@/components/time-entry-form'
import { Badge, Button, Card, Label, Select } from '@/components/ui'
import { createClient } from '@/lib/supabase-browser'
import type { PaymentStatus, Project, TimeEntry } from '@/lib/types'
import {
  formatCurrency,
  formatDate,
  formatHours,
  getMonthOptions,
  getProjectPaymentStatus,
  isEntryInMonth,
  paymentStatusClasses,
  paymentStatusLabel,
  statusLabel,
} from '@/lib/utils'

export default function ProjectPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [savingStatus, setSavingStatus] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const monthOptions = getMonthOptions()
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]?.value ?? '')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: authData } = await supabase.auth.getUser()
      const userId = authData.user?.id
      if (!userId) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
      if (profile?.role !== 'admin') {
        router.push('/viewer')
        return
      }

      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single()
      if (projectError) throw projectError
      setProject(projectData)
      setPaymentStatus(getProjectPaymentStatus(projectData))

      const { data: entriesData, error: entriesError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('project_id', params.id)
        .order('work_date', { ascending: false })
      if (entriesError) throw entriesError
      setEntries(entriesData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nu am putut încărca proiectul.')
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredEntries = useMemo(() => {
    if (!selectedMonth) return entries
    return entries.filter((entry) => isEntryInMonth(entry.work_date, selectedMonth))
  }, [entries, selectedMonth])

  const totals = useMemo(() => {
    const billableEntries = filteredEntries.filter((entry) => entry.billable)
    const hours = billableEntries.reduce((sum, entry) => sum + Number(entry.hours), 0)
    const amount = project ? hours * Number(project.hourly_rate) : 0
    return {
      hours,
      amount,
      entriesCount: filteredEntries.length,
    }
  }, [filteredEntries, project])

  async function handlePaymentStatusSave() {
    if (!project) return

    setSavingStatus(true)
    setStatusMessage(null)
    setError(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('projects')
        .update({ payment_status: paymentStatus })
        .eq('id', project.id)

      if (updateError) throw updateError

      setProject({ ...project, payment_status: paymentStatus })
      setStatusMessage('Statusul plății a fost actualizat.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nu am putut salva statusul plății.')
    } finally {
      setSavingStatus(false)
    }
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">Se încarcă proiectul...</main>
  }

  if (!project) {
    return <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">Proiectul nu există.</main>
  }

  const currentPaymentStatus = getProjectPaymentStatus(project)

  return (
    <AppShell title={project.name} subtitle={`Client: ${project.client_name}`}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" /> Înapoi
        </Link>
        <Badge>{statusLabel(project.status)}</Badge>
        <Badge className={paymentStatusClasses(currentPaymentStatus)}>{paymentStatusLabel(currentPaymentStatus)}</Badge>
      </div>

      {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}
      {statusMessage ? <p className="mb-4 text-sm text-emerald-600">{statusMessage}</p> : null}

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
          <div>
            <Label>Status plată</Label>
            <Select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}>
              <option value="unpaid">Neplătit</option>
              <option value="partial">Plată parțială</option>
              <option value="paid">Plătit</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={handlePaymentStatusSave} disabled={savingStatus} className="w-full md:w-auto">
              {savingStatus ? 'Se salvează...' : 'Salvează status plată'}
            </Button>
          </div>
        </div>
        {project.description ? <p className="max-w-2xl text-sm text-slate-500">{project.description}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Tarif / oră</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{formatCurrency(project.hourly_rate, project.currency)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Ore totale</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{formatHours(totals.hours)}h</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Total de plată</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{formatCurrency(totals.amount, project.currency)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Intrări în luna selectată</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{totals.entriesCount}</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-lg font-semibold text-slate-900">Time entries</h3>
            <p className="mt-1 text-sm text-slate-500">Zi, durată, categorie, observații și valoare pentru munca depusă.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredEntries.length ? (
              filteredEntries.map((entry) => {
                const rowAmount = Number(entry.hours) * Number(project.hourly_rate)
                return (
                  <div key={entry.id} className="grid gap-3 px-6 py-4 md:grid-cols-[140px_90px_140px_1fr_140px]">
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
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Valoare</p>
                      <p className="mt-1 text-sm font-medium text-slate-800">{formatCurrency(rowAmount, project.currency)}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="px-6 py-8 text-sm text-slate-500">Nu există încă ore adăugate pentru luna selectată.</div>
            )}
          </div>
        </Card>

        <TimeEntryForm projectId={project.id} onCreated={loadData} />
      </div>
    </AppShell>
  )
}
