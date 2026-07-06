-- supabase/migrations/20260607120000_add_db_invoices.sql

create table if not exists invoices (
  id bigserial primary key,
  invoice_number text not null unique,
  client_name text not null,
  client_email text not null,
  client_address text,
  issue_date date not null default current_date,
  due_date date not null default (current_date + interval '14 day'),
  items jsonb not null default '[]',
  subtotal numeric not null default 0,
  tax_rate numeric not null default 0,
  tax_amount numeric not null default 0,
  total numeric not null default 0,
  notes text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_number_idx on invoices(invoice_number);
create index if not exists invoices_status_idx on invoices(status);
create index if not exists invoices_created_at_idx on invoices(created_at desc);
