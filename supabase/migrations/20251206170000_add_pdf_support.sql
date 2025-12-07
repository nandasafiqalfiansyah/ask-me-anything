-- Add PDF file support to certificates table
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS pdf_url text;

-- Create storage bucket for certificate PDFs
-- IMPORTANT: This must be created manually after running the migration
-- Run this SQL in Supabase dashboard or via supabase CLI:
-- insert into storage.buckets (id, name, public) values ('certificate-pdfs', 'certificate-pdfs', true)
-- on conflict (id) do nothing;
