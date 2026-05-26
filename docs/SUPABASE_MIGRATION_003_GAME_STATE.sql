-- =====================================================================
-- Migration 003 — game_state table
-- Spustit jednou v Supabase SQL editoru. Idempotentní.
--
-- Tabulka má jediný řádek (id = 1) a drží globální stav hry:
--   is_closed = false → hra běží (registrace + odpovědi povolené)
--   is_closed = true  → hra uzavřena (slosování v admin UI)
-- =====================================================================

create table if not exists public.game_state (
  id         smallint primary key check (id = 1),
  is_closed  boolean     not null default false,
  closed_at  timestamptz
);

alter table public.game_state enable row level security;

-- Žádné policies — pouze service_role (server) má přístup.

insert into public.game_state (id, is_closed, closed_at)
values (1, false, null)
on conflict (id) do nothing;
