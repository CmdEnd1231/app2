import Link from 'next/link'
import type { Route } from 'next'
import { ArrowUpRight, Clock3, Wallet } from 'lucide-react'

import { Badge, Card } from '@/components/ui'
import type { Project } from '@/lib/types'
import { formatCurrency, formatHours, statusLabel } from '@/lib/utils'

export function ProjectCard({
  project,
  hours,
  amount,
}: {
  project: Project
  hours: number
  amount: number
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-950">{project.name}</h3>
            <Badge>{statusLabel(project.status)}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">Client: {project.client_name}</p>
          {project.description ? <p className="mt-3 max-w-2xl text-sm text-slate-500">{project.description}</p> : null}
        </div>
        <Link
          href={`/projects/${project.id}` as Route}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock3 className="h-4 w-4" /> Ore înregistrate
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{formatHours(hours)}h</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Wallet className="h-4 w-4" /> De încasat
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(amount, project.currency)}</p>
        </div>
      </div>
    </Card>
  )
}
