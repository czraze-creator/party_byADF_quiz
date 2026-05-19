-- =====================================================================
-- Migration 002 — rate_limits table
-- Spustit jednou v Supabase SQL editoru. Idempotentní (create if not exists).
-- =====================================================================

create table if not exists public.rate_limits (
  ip           text        not null,
  scope        text        not null,
  window_start timestamptz not null default now(),
  hits         int         not null default 1,
  primary key (ip, scope)
);

alter table public.rate_limits enable row level security;

-- Žádné policies — pouze service_role (server) má přístup, anon/auth jsou blokovaní.

-- Cleanup helper (volat ručně nebo přes pg_cron, není povinné):
-- delete from public.rate_limits where window_start < now() - interval '24 hours';
