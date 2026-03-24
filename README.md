# Worklog Portal

Aplicație web simplă pentru:
- proiecte
- ore lucrate
- tarif/oră
- total automat de plată
- acces viewer pentru client

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + Postgres + RLS
- Vercel pentru deploy

## Ce știe să facă versiunea finală
- login cu magic link
- dashboard admin
- creare proiecte
- adăugare ore lucrate
- calcul automat ore × tarif
- filtru pe lună
- portal viewer pentru client
- reguli de acces ca fiecare client să vadă doar proiectul lui

## Structură principală
- `/` landing page
- `/login` login
- `/dashboard` panou admin
- `/projects/[id]` detalii proiect
- `/viewer` portal client

## Setup rapid

### 1. Creează proiectul în Supabase
- proiect nou
- mergi în **SQL Editor**
- rulezi fișierul `supabase/schema.sql`

### 2. Pune-te admin
După primul login cu emailul tău, rulezi în SQL Editor:

```sql
update public.profiles
set role = 'admin', full_name = 'Cosmin'
where email = 'ADRESA_TA_DE_EMAIL';
```

### 3. Configurează variabilele locale
Creezi fișierul `.env.local` pornind de la `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 4. Rulează local
```bash
npm install
npm run dev
```

### 5. Urcă în GitHub
```bash
git init
git add .
git commit -m "Initial commit - Worklog Portal"
git branch -M main
git remote add origin <repo-url>
git push -u origin main
```

### 6. Deploy în Vercel
- New Project
- alegi repo-ul GitHub
- adaugi cele 2 environment variables
- Deploy

### 7. Configurează redirect URLs în Supabase
În **Authentication > URL Configuration** adaugi:
- `http://localhost:3000/**`
- URL-ul final din Vercel cu `/**`

## Limitări actuale
- viewer-ul trebuie să existe deja în Supabase Auth ca să poată fi alocat pe proiect
- nu există edit / delete în UI
- nu există export PDF
- nu există încă invitare automată a clientului direct din interfață

## Ce merită în v2
- editare proiecte și intrări
- status de plată în UI
- export raport PDF
- interval custom de timp
- invitare client direct din aplicație
