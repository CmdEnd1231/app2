'use client'

import { useState } from 'react'

import { Button, Card, CardTitle, Input, Label, Textarea } from '@/components/ui'
import { createClient } from '@/lib/supabase-browser'

export function TimeEntryForm({ projectId, onCreated }: { projectId: string; onCreated: () => Promise<void> }) {
  const [workDate, setWorkDate] = useState(new Date().toISOString().slice(0, 10))
  const [hours, setHours] = useState('1')
  const [category, setCategory] = useState('project management')
  const [notes, setNotes] = useState('')
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

      const { error } = await supabase.from('time_entries').insert({
        project_id: projectId,
        created_by: userId,
        work_date: workDate,
        hours: Number(hours),
        category,
        notes,
        billable: true,
      })

      if (error) throw error

      setHours('1')
      setCategory('project management')
      setNotes('')
      await onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nu am putut salva intrarea.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <CardTitle>Adaugă ore</CardTitle>
      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label>Data</Label>
          <Input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} required />
        </div>
        <div>
          <Label>Număr ore</Label>
          <Input type="number" min="0" step="0.25" value={hours} onChange={(e) => setHours(e.target.value)} required />
        </div>
        <div>
          <Label>Categorie</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="design / ads / meeting / management" />
        </div>
        <div>
          <Label>Observații</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ce ai făcut efectiv în sesiunea de lucru." />
        </div>
        <Button type="submit" disabled={loading}>{loading ? 'Se salvează...' : 'Salvează orele'}</Button>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </form>
    </Card>
  )
}
