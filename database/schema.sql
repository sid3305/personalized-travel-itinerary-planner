-- run in Supabase SQL editor
create table trips (
  id bigint generated always as identity primary key,
  destination text, params jsonb, plan jsonb,
  created_at timestamptz default now()
);
alter table trips disable row level security; -- demo only; add auth + RLS for production
