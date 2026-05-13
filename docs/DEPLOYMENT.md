# Deployment Guide

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Aplikace běží na `http://localhost:3000`. Data se ukládají do `.data/quiz.json` (gitignorováno).

Admin přihlášení: heslo z `ADMIN_PASSWORD` (default `adf2026` — **změň!**).

## Reset dev dat

```bash
rm -rf .data/
```

Při dalším spuštění se znovu vytvoří se seed daty (4 stanoviště, 4 otázky).

## Produkční deploy (Vercel)

1. **Push do GitHub repa.**
2. **Vercel → Import Project** → vybrat repo.
3. **Environment Variables:**
   - `ADMIN_PASSWORD` — silné heslo (např. `openssl rand -base64 24`).
   - `QUIZ_DATA_DIR=/tmp/quiz` — pozor: Vercel filesystem je ephemerální, viz níže.
4. **Deploy.**

### ⚠️ Pozor: lokální JSON store není pro produkci

Aktuální implementace ukládá data do JSON souboru. To je OK pro:
- lokální vývoj
- demo na jedné instanci serveru

**NENÍ to OK pro:**
- Vercel / Lambda / Edge (ephemerální FS, ztratíš data při restartu)
- Multi-instance setup

**Pro reálný event nasaď Supabase nebo PostgreSQL:**

### Supabase setup (production-ready)

1. Vytvoř projekt na [supabase.com](https://supabase.com).
2. SQL editor → spusť migraci z `docs/SUPABASE_SCHEMA.sql` (TODO — připravit).
3. Doplň env vars do Vercel:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
4. Přepiš `src/lib/db/store.ts` na Supabase implementaci (TODO — připraveno jako iterace v2).

> Migrace na Supabase nemění UI ani API kontrakt — pouze `lib/db/store.ts`. Plánováno jako další krok po review tohoto MVP.

## Tisk QR kódů

1. Přihlas se na `/admin` → **QR kódy**.
2. Klikni **Tisknout** — výchozí formát A5.
3. Doporučení: tiskni v barvě, lamiňuj, nainstaluj na stanoviště ve výšce očí.

QR míří na hlavní URL hry (`/`). Kód stanoviště je vytištěný jako text — host ho přečte a opíše.

## Domain & DNS

Pokud chceš vlastní doménu (např. `party.analyticsdf.com`):

1. V Vercel projekt → **Domains** → přidej.
2. V DNS providers nastav CNAME na `cname.vercel-dns.com`.
3. HTTPS Vercel řeší automaticky.

## Bezpečnost před spuštěním

- [ ] `ADMIN_PASSWORD` změněno z default.
- [ ] Supabase RLS politiky nastavené (pokud Supabase).
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
   - V případě problému: změň kód stanoviště přes Supabase Dashboard (do MVP local store: edit `.data/quiz.json` a restart).

3. **Slosování:**
   - Na pódiu: `/admin/dashboard` → **Vylosovat výherce** → ukáže náhodně vybraného z eligible.
   - CSV export ulož pro pozdější marketing follow-up (pokud souhlas).
