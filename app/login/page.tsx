'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'

import { Button, Card, CardTitle, Input, Label } from '@/components/ui'
import { createClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
        },
      })

      if (error) throw error

      setMessage('Linkul de login a fost trimis pe email.')
      setTimeout(() => router.push('/dashboard'), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'A apărut o eroare la autentificare.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
          <Mail className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl">Autentificare</CardTitle>
        <p className="mt-2 text-sm text-slate-500">Intră cu magic link. Simplu și fără parole complicate.</p>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cosmin@exemplu.ro"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Se trimite...' : 'Trimite link de login'}
          </Button>
        </form>

        {message ? <p className="mt-4 text-sm text-brand-700">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      </Card>
    </main>
  )
}
