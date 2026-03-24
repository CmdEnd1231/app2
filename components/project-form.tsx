'use client'

import { useState } from 'react'

import { Button, Card, CardTitle, Input, Label, Textarea } from '@/components/ui'
import { createClient } from '@/lib/supabase-browser'

export function ProjectForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [hourlyRate, setHourlyRate] = useState('150')
  const [description, setDescription] = useState('')
  const [viewerEmail, setViewerEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: authData } = await supabase.auth.getUser()
      const userId = authData.user?.id

      if (!userId) throw new Error('Nu există sesiune activă.')

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          owner_user_id: userId,
          name,
          client_name: clientName,
          description,
          hourly_rate: Number(hourlyRate),
          currency: 'RON',
          status: 'active',
        })
        .select()
        .single()

      if (projectError) throw projectError

      if (viewerEmail.trim()) {
        const { data: viewer } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', viewerEmail.trim())
          .maybeSingle()

        if (viewer?.id) {
          const { error: mapError } = await supabase
            .from('project_viewers')
            .insert({ project_id: project.id, viewer_user_id: viewer.id })
          if (mapError) throw mapError
        }
      }

      setName('')
      setClientName('')
      setHourlyRate('150')
      setDescription('')
      setViewerEmail('')
      await onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nu am putut crea proiectul.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <CardTitle>Adaugă proiect</CardTitle>
      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label>Nume proiect</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="CatalogMoto" required />
        </div>
        <div>
          <Label>Nume client</Label>
          <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Răzvan Pavel" required />
        </div>
        <div>
          <Label>Tarif / oră (lei)</Label>
          <Input type="number" min="0" step="1" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} required />
        </div>
        <div>
          <Label>Email viewer</Label>
          <Input value={viewerEmail} onChange={(e) => setViewerEmail(e.target.value)} placeholder="client@exemplu.ro" />
        </div>
        <div>
          <Label>Observații</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalii proiect, limite, context." />
        </div>
        <Button type="submit" disabled={loading}>{loading ? 'Se salvează...' : 'Creează proiect'}</Button>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </form>
    </Card>
  )
}
