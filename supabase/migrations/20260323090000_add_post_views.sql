-- supabase/migrations/20260323090000_add_post_views.sql

create table if not exists post_views (
  slug text primary key,
  views bigint not null default 0,
  updated_at timestamp with time zone not null default now()
);

create index if not exists post_views_updated_at_idx on post_views(updated_at desc);

create or replace function increment_post_views(post_slug text)
returns bigint
language plpgsql
as $$
declare
  next_views bigint;
begin
  insert into post_views (slug, views, updated_at)
  values (post_slug, 1, now())
  on conflict (slug)
  do update set
    views = post_views.views + 1,
    updated_at = now()
  returning views into next_views;

  return next_views;
end;
$$;
