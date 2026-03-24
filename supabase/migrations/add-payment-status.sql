alter table public.projects
add column if not exists payment_status text not null default 'unpaid';

alter table public.projects
  drop constraint if exists projects_payment_status_check;

alter table public.projects
  add constraint projects_payment_status_check
  check (payment_status in ('unpaid', 'partial', 'paid'));

update public.projects
set payment_status = 'unpaid'
where payment_status is null;
