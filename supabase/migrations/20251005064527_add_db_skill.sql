-- supabase/migrations/20251005_create_skills.sql
create table if not exists skills (
  id serial primary key,
  name text not null unique,
  created_at timestamp with time zone default now()
);