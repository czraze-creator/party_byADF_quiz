-- =====================================================================
-- Party byADF Quiz 2026 — Supabase schema
-- Spustit jednou v Supabase SQL editoru po vytvoření projektu.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table if not exists public.stations (
  id          smallint primary key,
  name        text     not null,
  emoji       text     not null,
  hint        text     not null,
  code        text     not null,            -- server-only secret (validace odpovědi)
  order_index smallint not null
);

create table if not exists public.questions (
  id          text     primary key,
  station_id  smallint not null references public.stations(id) on delete cascade,
  text        text     not null,
  emoji       text     not null
);

create table if not exists public.answers (
  id          text     primary key,
  question_id text     not null references public.questions(id) on delete cascade,
  text        text     not null,
  is_correct  boolean  not null              -- server-only — never sent to client
);

create index if not exists answers_question_id_idx on public.answers(question_id);

create table if not exists public.participants (
  id                 text        primary key,
  name               text        not null,
  email              text        not null,
  phone              text,
  consent_marketing  boolean     not null default false,
  session_token      text        not null unique,
  created_at         timestamptz not null default now()
);

create unique index if not exists participants_email_lower_idx
  on public.participants (lower(email));

create index if not exists participants_session_token_idx
  on public.participants (session_token);

create table if not exists public.progress (
  participant_id      text     not null references public.participants(id) on delete cascade,
  station_id          smallint not null references public.stations(id) on delete cascade,
  unlocked_at         timestamptz,
  answered_at         timestamptz,
  selected_answer_id  text     references public.answers(id) on delete set null,
  is_correct          boolean,
  primary key (participant_id, station_id)
);

create index if not exists progress_participant_idx on public.progress (participant_id);

-- ---------------------------------------------------------------------
-- Row Level Security
-- Tabulky neotevíráme přes anon/auth klienty — všechen přístup jde přes
-- service role z Next.js server kódu (route handlery, server actions).
-- RLS zapneme, ale neuvádíme žádné policy → anon i auth role nemá přístup.
-- Service role RLS obchází automaticky.
-- ---------------------------------------------------------------------

alter table public.stations     enable row level security;
alter table public.questions    enable row level security;
alter table public.answers      enable row level security;
alter table public.participants enable row level security;
alter table public.progress     enable row level security;

-- ---------------------------------------------------------------------
-- Seed data — stanoviště
-- ---------------------------------------------------------------------

insert into public.stations (id, name, emoji, hint, code, order_index) values
  (1, 'Raut',       '🍽️',  'Kde to celý začíná — u jídla.',     'ALFA',   1),
  (2, 'Bar',        '🍸',  'Tam, kde se debatuje nejlíp.',       'TONIC',  2),
  (3, 'Fotokoutek', '📸',  'Vzpomínka, kterou si vezmeš domů.',  'FLASH',  3),
  (4, 'Vyhlídka',   '🥃',  'Degustace u Karla. Finále.',         'SUMMIT', 4)
on conflict (id) do update set
  name        = excluded.name,
  emoji       = excluded.emoji,
  hint        = excluded.hint,
  code        = excluded.code,
  order_index = excluded.order_index;

-- ---------------------------------------------------------------------
-- Seed data — otázky
-- ---------------------------------------------------------------------

insert into public.questions (id, station_id, text, emoji) values
  ('q1', 1, 'Kde v Praze má ADF kancelář?',                                                                          '🏢'),
  ('q2', 2, 'Kdo je CEO ADF?',                                                                                       '👔'),
  ('q3', 3, 'Jaká služba chybí ve výběru: Datová řešení, Cyber security, IT support, IT contracting?',               '🤖'),
  ('q4', 4, 'Kolik let slaví ADF?',                                                                                  '🎉')
on conflict (id) do update set
  station_id = excluded.station_id,
  text       = excluded.text,
  emoji      = excluded.emoji;

-- ---------------------------------------------------------------------
-- Seed data — odpovědi
-- ---------------------------------------------------------------------

insert into public.answers (id, question_id, text, is_correct) values
  ('q1a1', 'q1', 'Pankrác',                    true),
  ('q1a2', 'q1', 'Florenc',                    false),
  ('q1a3', 'q1', 'Náměstí Republiky',          false),

  ('q2a1', 'q2', 'Kamil Mahdal',               true),
  ('q2a2', 'q2', 'Lenka Mahdal',               false),
  ('q2a3', 'q2', 'Karel Mahdal',               false),

  ('q3a1', 'q3', 'AI automatizace',            true),
  ('q3a2', 'q3', 'Cloudová infrastruktura',    false),
  ('q3a3', 'q3', 'Vývoj softwaru',             false),

  ('q4a1', 'q4', '10',                         true),
  ('q4a2', 'q4', '15',                         false),
  ('q4a3', 'q4', '20',                         false)
on conflict (id) do update set
  question_id = excluded.question_id,
  text        = excluded.text,
  is_correct  = excluded.is_correct;
