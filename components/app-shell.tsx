'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { usePathname, useRouter } from 'next/navigation'
import { FolderKanban, LayoutDashboard, LogOut, ReceiptText, Users } from 'lucide-react'
import { type ReactNode } from 'react'

import { createClient } from '@/lib/supabase-browser'
import { cn } from '@/lib/utils'

const nav: Array<{ href: Route; label: string; icon: typeof LayoutDashboard }> = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard', label: 'Proiecte', icon: FolderKanban },
  { href: '/viewer', label: 'Portal client', icon: Users },
]

export function AppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[260px_1fr] lg:px-6">
        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 font-semibold text-white">
              WL
            </div>
            <h1 className="mt-4 text-lg font-semibold text-slate-900">Worklog Portal</h1>
            <p className="mt-1 text-sm text-slate-500">Ore, proiecte și totaluri clare pentru tine și clienții tăi.</p>
          </div>

          <nav className="space-y-2">
            {nav.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href || (item.href === '/dashboard' && pathname.startsWith('/projects'))
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                    active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-10 rounded-3xl bg-slate-900 p-4 text-white">
            <ReceiptText className="h-5 w-5" />
            <p className="mt-3 text-sm font-medium">GitHub ready. Vercel ready. Gândit ca MVP simplu, dar extensibil.</p>
          </div>

          <button
            onClick={signOut}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        <main className="py-2">
          <div className="mb-6">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h2>
            {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
