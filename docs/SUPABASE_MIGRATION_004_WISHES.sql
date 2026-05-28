-- =====================================================================
-- Migration 004 — wishes table
-- Spustit jednou v Supabase SQL editoru. Idempotentní.
--
-- 1 přání na účastníka (PK = participant_id, upsert pattern).
-- Po dokončení kvízu si host nepovinně zapíše přání ADF k 10. výročí;
-- admin pak může losovat samostatnou bonusovou cenu mezi autory přání.
-- =====================================================================

create table if not exists public.wishes (
  participant_id text        primary key references public.participants(id) on delete cascade,
  text           text        not null check (length(text) between 1 and 1000),
  created_at     timestamptz not null default now()
);

alter table public.wishes enable row level security;

-- Žádné policies — pouze service_role (server) má přístup.
