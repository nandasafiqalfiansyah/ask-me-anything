-- supabase/migrations/20251207081835_add_db_projects.sql

-- Create projects table
create table if not exists projects (
  id serial primary key,
  slug text not null unique,
  title text not null,
  summary text,
  image_url text,
  author text default 'ndav',
  tags text[], -- Array of tags
  published_at date not null,
  content text not null, -- MDX content
  sort_order integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes
create index if not exists projects_slug_idx on projects(slug);
create index if not exists projects_sort_order_idx on projects(sort_order);
create index if not exists projects_published_at_idx on projects(published_at desc);

-- Create storage bucket for project images
-- IMPORTANT: This must be created manually after running the migration
-- Run this SQL in Supabase dashboard or via supabase CLI:
-- insert into storage.buckets (id, name, public) values ('project-images', 'project-images', true)
-- on conflict (id) do nothing;
