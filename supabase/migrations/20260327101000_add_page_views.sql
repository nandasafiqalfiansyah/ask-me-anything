-- supabase/migrations/20260327101000_add_page_views.sql

create table if not exists page_views (
  page_key text primary key,
  views bigint not null default 0,
  updated_at timestamp with time zone not null default now()
);

create index if not exists page_views_updated_at_idx on page_views(updated_at desc);

create or replace function increment_page_views(page_key text)
returns bigint
language plpgsql
as $$
declare
  next_views bigint;
begin
  insert into page_views (page_key, views, updated_at)
  values (page_key, 1, now())
  on conflict (page_key)
  do update set
    views = page_views.views + 1,
    updated_at = now()
  returning views into next_views;

  return next_views;
end;
$$;