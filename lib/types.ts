export type Role = 'admin' | 'viewer'

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: Role
}

export type Project = {
  id: string
  owner_user_id: string
  name: string
  client_name: string
  description: string | null
  hourly_rate: number
  currency: string
  status: 'active' | 'paused' | 'closed'
  created_at: string
}

export type TimeEntry = {
  id: string
  project_id: string
  created_by: string
  work_date: string
  hours: number
  notes: string | null
  category: string | null
  billable: boolean
  created_at: string
}

export type ProjectViewer = {
  id: string
  project_id: string
  viewer_user_id: string
}
