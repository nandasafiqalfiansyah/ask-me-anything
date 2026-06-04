-- supabase/migrations/20260604120000_add_db_posts.sql

create table if not exists posts (
  id serial primary key,
  slug text not null unique,
  title text not null,
  summary text,
  image_url text,
  author text default 'Admin',
  published_at date not null default current_date,
  published boolean not null default false,
  content text not null default '',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists posts_slug_idx on posts(slug);
create index if not exists posts_published_idx on posts(published);
create index if not exists posts_published_at_idx on posts(published_at desc);
