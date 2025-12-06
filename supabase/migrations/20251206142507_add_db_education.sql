-- supabase/migrations/20251206142507_add_db_education.sql

-- Create education table
create table if not exists education (
  id serial primary key,
  title text not null,
  summary text not null,
  published_at date not null,
  logo_url text,
  link text,
  description text,
  sort_order integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for ordering
create index if not exists education_sort_order_idx on education(sort_order);

-- Create storage bucket for education logos (run manually in Supabase dashboard or via supabase CLI)
-- insert into storage.buckets (id, name, public) values ('education-logos', 'education-logos', true);
