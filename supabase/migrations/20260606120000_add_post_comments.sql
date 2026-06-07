-- supabase/migrations/20260606120000_add_post_comments.sql

create table if not exists post_comments (
  id bigserial primary key,
  post_slug text not null,
  author_name text not null default 'Anonymous',
  content text not null,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists post_comments_post_slug_idx
  on post_comments (post_slug);

create index if not exists post_comments_sort_idx
  on post_comments (post_slug, is_pinned desc, created_at desc);
