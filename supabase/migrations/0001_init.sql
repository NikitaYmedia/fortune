-- Neemo Dashboard schema (stage 2). Run in the Supabase SQL editor or via the CLI.
create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  preferred_locale text not null default 'en' check (preferred_locale in ('en','uk')),
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '',
  problem_statement text not null default '',
  purpose text not null default '',
  main_goal text not null default '',
  expected_outcome text not null default '',
  scope text not null default '',
  requirements text not null default '',
  links text not null default '',
  additional_information text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '',
  status text not null default 'todo' check (status in ('todo','in_progress','done')),
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  start_date date,
  due_date date,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  check (start_date is null or due_date is null or due_date >= start_date)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  content text not null default '',
  type text not null default 'note' check (type in ('note','idea')),
  tags text[] not null default '{}',
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  due_date date,
  status text not null default 'planned' check (status in ('planned','in_progress','done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.projects (owner_id);
create index on public.tasks (project_id, status);
create index on public.tasks (owner_id, due_date);
create index on public.notes (project_id, is_pinned);
create index on public.milestones (project_id, due_date);

-- Row Level Security: each user only sees and changes their own rows.
alter table public.profiles   enable row level security;
alter table public.projects   enable row level security;
alter table public.tasks      enable row level security;
alter table public.notes      enable row level security;
alter table public.milestones enable row level security;

create policy "own profile" on public.profiles for all
  using (id = auth.uid()) with check (id = auth.uid());
create policy "own projects" on public.projects for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own tasks" on public.tasks for all
  using (owner_id = auth.uid()) with check (
    owner_id = auth.uid() and exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));
create policy "own notes" on public.notes for all
  using (owner_id = auth.uid()) with check (
    owner_id = auth.uid() and exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));
create policy "own milestones" on public.milestones for all
  using (owner_id = auth.uid()) with check (
    owner_id = auth.uid() and exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));

-- Auto-create a profile on sign-up.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
