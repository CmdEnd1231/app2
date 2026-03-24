import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Worklog Portal',
  description: 'Simple time tracking and billing portal built with Next.js, Supabase and Vercel.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  )
}
