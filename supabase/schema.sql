-- neko-health スキーマ
-- Supabase SQL Editor で実行する
-- 冪等運用したい場合は事前に drop table を走らせてから

create extension if not exists "pgcrypto";

create table if not exists households (
  id           uuid primary key default gen_random_uuid(),
  secret_slug  text unique not null,
  created_at   timestamptz not null default now()
);

create table if not exists cats (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references households(id) on delete cascade,
  name          text not null,
  icon          text not null default '🐈',
  created_at    timestamptz not null default now()
);

create index if not exists cats_household on cats (household_id);

create table if not exists records (
  id            uuid primary key default gen_random_uuid(),
  cat_id        uuid not null references cats(id) on delete cascade,
  kind          text not null check (kind in ('food', 'water')),
  food_type     text check (food_type in ('dry', 'wet')),
  amount        integer not null check (amount > 0),
  unit          text not null check (unit in ('g', 'ml')),
  recorded_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index if not exists records_cat_recorded on records (cat_id, recorded_at desc);

-- MVP は service_role で書き込む。RLS 無効（アプリ層で secret 検証）
alter table households disable row level security;
alter table cats disable row level security;
alter table records disable row level security;
