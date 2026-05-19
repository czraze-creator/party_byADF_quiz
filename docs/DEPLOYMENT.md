# Deployment Guide

## Architektura (rozhodnuto 2026-05-19)

- **Hosting:** Vercel (Next.js 16 + App Router)
- **Datový store:** Supabase (PostgreSQL)
- **Doména:** `partybyadf.byvychodil.com` (osobní doména Aleše Vychodila)
- **Repo:** [github.com/czraze-creator/party_byADF_quiz](https://github.com/czraze-creator/party_byADF_quiz)

## Local development

```bash
cp .env.example .env.local
# Vyplň Supabase credentials (URL + anon key + service role key)
npm install
npm run dev
```

Aplikace běží na `http://localhost:3000` (nebo `PORT=3210 npm run dev`).

Admin přihlášení: heslo z `ADMIN_PASSWORD` (default `adf2026` — **změň před produkcí!**).

## Reset dev dat

V Supabase SQL editoru:

```sql
truncate table progress;
truncate table participants cascade;
```

Stations / questions / answers zůstávají (statická seed data).

## Supabase setup (one-time)

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project** (region: EU Central / Frankfurt, plan: Free).
2. SQL editor → spusť celý obsah `docs/SUPABASE_SCHEMA.sql` (vytvoří 5 tabulek + naseed-uje stations/questions/answers).
3. Project Settings → API → zkopíruj:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **NIKDY** neexponuj na klientu

> RLS je v SQL skriptu zapnuté pro `participants` a `progress`. Server používá `service_role` klíč, který RLS obchází. Anon klíč je v repu prozatím nevyužitý (připraven pro browser-side čtení).

## Vercel deploy

### Initial setup

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → vybrat `czraze-creator/party_byADF_quiz`.
2. **Framework Preset:** Next.js (auto-detected).
3. **Environment Variables** (Production + Preview + Development):
   - `ADMIN_PASSWORD` — silné heslo (např. `openssl rand -base64 18`).
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **Deploy.**

### Push-to-deploy

Každý push na `main` triggeruje produkční deploy. PR / branche dostávají preview URL automaticky.

## Custom doména

1. V Vercel projekt → **Settings → Domains** → přidej `partybyadf.byvychodil.com`.
2. Vercel ti ukáže buď CNAME (`cname.vercel-dns.com`) nebo A-záznam — záleží jestli je `byvychodil.com` apex nebo subdoména.
3. V DNS providera (kde běží `byvychodil.com`) nastav záznam dle Vercelu.
4. HTTPS Vercel řeší automaticky (Let's Encrypt).

## Tisk QR kódů

1. Přihlas se na `/admin` → **QR kódy**.
2. Klikni **Tisknout** — výchozí formát A5.
3. Doporučení: tiskni v barvě, lamiňuj, nainstaluj na stanoviště ve výšce očí.

QR míří na hlavní URL hry (`/`). Kód stanoviště je vytištěný jako text — host ho přečte a opíše.

## Bezpečnost před spuštěním

- [ ] `ADMIN_PASSWORD` změněno z default.
- [x] Supabase RLS politiky nastavené (`participants` + `progress`).
- [ ] `robots.txt` zakazuje indexaci `/admin` a `/api`.
- [ ] Privacy policy link funguje (TODO — text dodá ADF).
- [ ] Rate limiting (TODO — přidat před eventem).
- [ ] Sentry / monitoring nastaveno (volitelné).

## V den eventu

1. **Před otevřením brány:**
   - Otevři `/admin/dashboard` na laptopu / tabletu — live se obnovuje každých 5 s.
   - Otestuj 1 plné kolo hry sám pro jistotu.

2. **Během eventu:**
   - Sleduj `/admin/dashboard` — pokud někdo „uvízne" na stanovišti (mnoho `unlocked` ale málo `correct`), je tam problém.
   - V případě problému: změň kód stanoviště přímo v Supabase Dashboard → Table editor → `stations`.

3. **Slosování:**
   - Na pódiu: `/admin/dashboard` → **Vylosovat výherce** → ukáže náhodně vybraného z eligible.
   - CSV export ulož pro pozdější marketing follow-up (pokud souhlas).
