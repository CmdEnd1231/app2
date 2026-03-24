import Link from 'next/link'
import { ArrowRight, CheckCircle2, ShieldCheck, TimerReset, WalletCards } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-16 lg:px-6">
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800">
            Project time tracking pentru freelanceri și project managers
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-slate-950">
            Ține evidența orelor lucrate și arată clienților exact cât au de plătit.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Worklog Portal este construit pentru un flux simplu: proiecte, ore lucrate, observații și total automat de plată. Fără haos. Fără complicații.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/login" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
              Intră în aplicație
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#benefits" className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Vezi cum funcționează
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Ore logate', '34.5h'],
              ['De încasat', '3.450 lei'],
              ['Proiecte active', '4'],
              ['Status', '2 neplătite'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-dashed border-slate-200 p-5">
            <p className="text-sm font-medium text-slate-800">Ce primești în MVP</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-brand-700" /> proiecte + time entries</div>
              <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-brand-700" /> acces viewer securizat</div>
              <div className="flex items-center gap-3"><TimerReset className="h-4 w-4 text-brand-700" /> total ore pe perioadă</div>
              <div className="flex items-center gap-3"><WalletCards className="h-4 w-4 text-brand-700" /> calcul automat ore × tarif</div>
            </div>
          </div>
        </div>
      </div>

      <section id="benefits" className="mt-20 grid gap-5 md:grid-cols-3">
        {[
          ['Rapid de lansat', 'Next.js pe Vercel pentru deploy simplu și repo GitHub curat.'],
          ['Control pe acces', 'Supabase RLS astfel încât fiecare viewer să vadă doar proiectul lui.'],
          ['Extensibil', 'Mai târziu poți adăuga PDF-uri, plăți, rapoarte și invoice logic.'],
        ].map(([title, text]) => (
          <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
