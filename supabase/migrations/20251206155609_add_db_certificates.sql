-- supabase/migrations/20251206155609_add_db_certificates.sql

-- Create certificates table
create table if not exists certificates (
  id serial primary key,
  title text not null,
  company text not null,
  issued_date date not null,
  certificate_url text,
  image_url text,
  description text,
  sort_order integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for ordering
create index if not exists certificates_sort_order_idx on certificates(sort_order);

-- Create index for company (for grouping)
create index if not exists certificates_company_idx on certificates(company);

-- Create storage bucket for certificate images
-- IMPORTANT: This must be created manually after running the migration
-- Run this SQL in Supabase dashboard or via supabase CLI:
-- insert into storage.buckets (id, name, public) values ('certificate-images', 'certificate-images', true)
-- on conflict (id) do nothing;
