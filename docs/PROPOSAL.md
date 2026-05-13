# Návrh řešení — Party byADF 2026 Quiz

**Verze:** v0.1 (iniciální návrh, čeká se zpětná vazba)
**Datum:** 2026-05-13
**Autor:** Claude (pro Aleše / ADF)

---

## 1. Vize & guiding principy

> „Když host naskenuje QR a otevře se mu naše appka, první reakce má být: **wow, tohle bych chtěl, kdo to dělal**."

Aplikace má pět rolí najednou:

1. **Hra** — quiz, který motivuje host přejít k všem stanovištím.
2. **Brand showcase** — důkaz, že ADF umí dodat polished digitální produkt.
3. **Lead capture** — sběr jména/e-mailu pro slosování (a marketing list).
4. **Eventový nástroj** — funguje rychle, bez friction, na špatné WiFi.
5. **Vzpomínka** — host si po eventu ještě zaslouženě prohlédne app i nasdílí.

### Guiding principy

| Princip | Jak se projeví |
|---|---|
| **Mobile-first, ale ne mobile-only** | Layout cílí na portrait 360–430 px, ale na tabletu/desktopu má samostatný layout (ne jen roztažený mobil). |
| **Méně je víc** | Žádné rušivé elementy. Jeden hero akcent na obrazovku, velká typografie, hodně whitespace. |
| **Pohyb dělá produkt živým** | Framer Motion na page transitions, micro-interactions, haptic feedback (vibrace na mobilu). |
| **Server-trust** | Správné odpovědi a validace kódů stanovišť **nikdy** nejsou v JS bundle. Vše ověřuje backend. |
| **Resilient k Wi-Fi** | Optimistic UI + offline cache progressu (localStorage + sync při návratu sítě). |
| **Bez instalace, ale jako appka** | PWA — add-to-home-screen, fullscreen, splash screen. |

---

## 2. Vizuální koncept

### 2.1 Design direction: „Elevated Tech-Premium"

Mood: **dark, hluboký, s pulzujícím akcentem**. Inspirace: Linear, Vercel, Stripe Press, Apple keynote slides. Cílem je _ne_ vypadat jako další event-app šablona — jako **product**.

**Layered visual systém:**

1. **Vrstva 0 — background:** tmavé navy (ADF primary `#0A2540`) s jemně animovaným „mesh gradient" (pomalu se pohybující barevné skvrny — cyan/teal akcent). Zajistí, že prázdné plochy nikdy nevypadají mrtvě.
2. **Vrstva 1 — glass cards:** poloprůhledné karty s blur efektem (glassmorphism, ale střídmě). Subtle border `rgba(255,255,255,0.08)`.
3. **Vrstva 2 — content:** velká typografie, čísla v monospace (Geist Mono / JetBrains Mono), text v moderním sans-serifu (Geist / Inter).
4. **Vrstva 3 — accent:** ADF cyan `#00B8D4` na CTA, progress, „splněno" stavech. Použít sparingly.

### 2.2 Brand colors (placeholder — ověřit s brand guide ADF)

```
Background deep:   #0A2540   (primary navy)
Surface:           #112B47   (1 stop lighter, glass base)
Accent primary:    #00B8D4   (cyan — CTA, success path)
Accent success:    #14E59A   (zelená — splněno)
Accent error:      #FF5470   (červená — špatná odpověď)
Text high:         #F7F9FC
Text muted:        #8AA0B5
Border subtle:     rgba(255,255,255,0.08)
```

> ⚠️ Před spuštěním verify s ADF brand guide (paměť má placeholder hodnoty 12 dní staré).

### 2.3 Typography

- **Display / headings:** Geist Sans (variable, fallback Inter)
- **Body:** Geist Sans
- **Mono / čísla:** Geist Mono

Velký kontrast velikostí: hero číslo stanoviště `text-7xl`, otázka `text-3xl`, label `text-xs uppercase tracking-widest`.

### 2.4 Motion

- **Page transitions:** subtle slide + fade (200–300ms, cubic-bezier easing).
- **Station unlock:** karta „rozsvítí se" — opacity + glow halo na 600ms.
- **Correct answer:** ✅ zelený puls + konfety (subtle, 1.5s) + haptic vibrate.
- **Wrong answer:** červený shake + haptic error pattern.
- **Background mesh:** kontinuální 30s loop pohybu blob gradientů (CSS animation, GPU).
- **Idle:** subtle „breathing" animace na CTA tlačítkách.

### 2.5 Mikro-detaily, co udělají rozdíl

- Custom cursor na desktopu (na CTA elementech).
- Subtle scan-line nebo grain texture overlay (1–2% opacity) — pocit „filmu", ne ploché grafiky.
- Progress bar nahoře s číselným counterm (`02 / 04`) v monospace fontu — vypadá to jako mission tracker.
- 60 FPS všechno, žádný jank.
- Sound on/off toggle — krátký pleasant „pop" při správné odpovědi (default off, host opt-in).

---

## 2.6 Stanoviště — finální seznam

| # | Lokace | Otázka | Emoji | Vibe |
|---|---|---|---|---|
| 01 | **Raut** | Kancelář ADF | 🏢 | „kde to celý začíná" |
| 02 | **Bar** | CEO ADF | 👔 | „kdo to celý vede" |
| 03 | **Fotokoutek** | AI automatizace | 🤖 | „co děláme nového" |
| 04 | **Vyhlídka (degustace u Karla)** | 10 let ADF | 🎉 | finále, oslavný moment |

Pořadí otázek lze přehodit — výše navržené má dramaturgii: začátek (kancelář) → tým (CEO) → současnost (AI) → oslava (10 let). Pokud chceš jinak, řekni.

## 3. Náhrada mapy — „Mission Journey"

Mapa areálu odpadla. Místo ní navrhuji jednu z těchto variant (doporučuji **A**):

### Varianta A — Vertical Journey Path ⭐ doporučeno

Vertikální „cesta" — animovaná čára shora dolů s 4 body (stanovišti). Každý bod je velká kartička:

```
   ●━━━━━━━━━━━━━ Stanoviště 01  ✅ splněno
   │                Kancelář ADF
   │
   ●━━━━━━━━━━━━━ Stanoviště 02  🔵 aktivní (pulse halo)
   │                Vedení ADF
   │
   ○ ╴ ╴ ╴ ╴ ╴ ╴ Stanoviště 03  ⏳ zamčeno
   │
   ○ ╴ ╴ ╴ ╴ ╴ ╴ Stanoviště 04  ⏳ zamčeno
```

**Plusy:**
- Vizuálně silné, „journey" metafora rezonuje s eventem (chodíš po areálu).
- Funguje stejně dobře na mobilu (scroll dolů) i desktopu.
- Nepotřebuje žádné fyzické rozmístění — host si stanoviště vyhledá podle čísla.
- Krásně se animuje (line draw on load, body se „odemykají" s glow halo).

**Stavy stanoviště:**
- **Zamčeno** (`○` outline, šedý text, lock ikona)
- **Aktivní** (`●` plný, pulsing cyan halo, otevřené pro zadání kódu)
- **Splněno** (`●` zelený, checkmark, ztmavený text)

> Host si vybírá stanoviště volně (ne lineárně) — ale aktivní je vždy to, co je rozdělané. Po zadání kódu se „odemkne".

### Varianta B — Hex/grid mosaic
4 hexagony nebo čtverce v gridu, každý jako velká karta. Vizuálně bohatší, ale na mobilu se hůř škáluje a působí víc jako menu než journey.

### Varianta C — Carousel/swipe deck
Tinder-style swipe mezi kartami stanovišť. Lifestyle vibe, ale skrývá overview (host nevidí najednou všechny stanoviště).

---

## 4. User flow & obrazovky

### 4.1 Mapa flow

```
QR scan → /
   │
   ▼
┌──────────────┐
│ 1. Landing   │  hero animation, „Začni hru" CTA
└──────────────┘
   │
   ▼
┌──────────────┐
│ 2. Onboarding│  pravidla (3 stepy, swipeable / next)
└──────────────┘
   │
   ▼
┌──────────────┐
│ 3. Identita  │  jméno + e-mail (+ telefon optional)
└──────────────┘
   │           ──── magic-link / session token uložen
   ▼
┌──────────────┐
│ 4. Journey   │ ◄─────────────────┐
│   (mission   │                   │
│    overview) │                   │
└──────────────┘                   │
   │ tap stanoviště                │
   ▼                               │
┌──────────────┐                   │
│ 5. Code unlock│ zadání kódu      │
└──────────────┘                   │
   │ kód OK                        │
   ▼                               │
┌──────────────┐                   │
│ 6. Otázka    │ multiple choice  │
└──────────────┘                   │
   │ klik = answer                 │
   ▼                               │
┌──────────────┐                   │
│ 7. Feedback  │ ✅/❌ + animace  │
└──────────────┘ ──────────────────┘
   │  (auto po 2s zpět na journey)
   │
   ▼ (všechny otázky správně)
┌──────────────┐
│ 8. Finish    │ „Jsi v slosování!" konfety, countdown
└──────────────┘
```

### 4.2 Detaily klíčových obrazovek

#### **1. Landing**
- Velké ADF logo (negativ verze pro dark BG).
- Hero text: **„10 let. Jeden quiz. Pět cen."** (number tweakneme dle reality slosování)
- Subtle animated badge: „PARTY BY ADF · ČERVEN 2026"
- Velké CTA tlačítko „Pojď do hry →" (cyan, glow, pulsing on idle)
- Pod CTA mini text: „Hra trvá ~10 minut · Bez instalace"

#### **2. Onboarding (3 stepy, swipeable)**
- Step 1: „Najdi stanoviště" + ikona 📍
- Step 2: „Zadej kód, odpověz na otázku" + ikona 🔑
- Step 3: „Zodpověz všechny správně, jsi v slosování o ceny" + ikona 🏆
- Skip link vpravo nahoře.

#### **3. Identita**
- Floating label input fields (Material-style ale modernější).
- Real-time validace e-mailu (formát).
- Optional telefon collapsed pod „chceš výhru rychleji? Nech telefon".
- Souhlas s GDPR/marketingem (checkbox, malý text + link na privacy policy).
- CTA: „Začít quiz".

#### **4. Journey overview**
- Top bar: ADF logo (mini) vlevo, progress `02 / 04` vpravo (monospace).
- Pod tím tenký progress bar (cyan, animovaný „shimmer" efekt).
- Vertikální journey path (viz Varianta A).
- Pod posledním stanovištěm „Slosování" placeholder — odemkne se až po dokončení.
- Pull-to-refresh enabled.

#### **5. Code unlock**
- Karta otevřená v modal-like full screen.
- Velký OTP-style input (4–6 boxů, monospace, auto-advance).
- Caps nezáleží (server normalizuje).
- Pod tím helper text: „Kód najdeš na stanovišti #02".
- Wrong code → shake + červený glow inputu + helper „Zkus to znovu, opiš přesně".
- Correct → animace přechodu na otázku (input se rozplyne, otázka fade in).

#### **6. Otázka**
- Ikonka otázky (emoji 🏢 atd.) — velká, nahoře v jemném glass kruhu.
- Otázka — `text-3xl`, font weight 500, centered.
- 3 odpovědi jako velké karty stack (full-width, 80px tall).
- Žádné radio buttony, žádné submit — klik = answer.
- Hover/press state: subtle scale 0.98 + glow.

#### **7. Feedback (po klepnutí na odpověď)**
- Klepnutá odpověď okamžitě → zelená nebo červená.
- Pokud špatně: ostatní odpovědi se ztmavují, správná zezelená (vysvětlení proč to bylo špatně? — volitelné).
- Konfety / haptic / sound (pokud zapnut) na správné.
- Auto-return na journey overview po 2s (s odpočtem nebo přes tap-anywhere).

#### **8. Finish screen**
- Hero: „Hotovo!" v obří typografii + ADF logo + konfety.
- „Jsi zařazen do slosování. Vyhlášení dnes ve 21:00 na hlavním pódiu."
- Countdown timer (live, monospace) do slosování.
- Tlačítko „Sdílej s kámošem" (Web Share API, fallback copy-link).
- Easter egg: tap 5× na logo → small animation reveal.

---

## 5. Technická architektura

### 5.1 Stack (doporučení)

| Vrstva | Volba | Proč |
|---|---|---|
| Framework | **Next.js 15** (App Router, RSC, TypeScript) | Server-side validace, edge functions, SEO není kritický ale výkon ano. |
| Styling | **Tailwind CSS v4** | Rychlost vývoje, konzistence, malý bundle. |
| Animace | **Framer Motion** | De facto standard pro polished React animace. |
| State (client) | **Zustand** + React Query (TanStack) | Lehké, žádné Redux ceremony. |
| Database + Auth | **Supabase** (Postgres + RLS + Realtime) | Lepší DX než Firebase pro tento usecase. Realtime se hodí na admin dashboard. |
| Hosting | **Vercel** | Zero-config s Next.js, Edge network blízko ČR (Frankfurt). |
| Email (optional, pokud chceme magic-link nebo confirmation) | **Resend** | Modern API, krásné templates. |
| Analytics | **Vercel Analytics** + **PostHog** (event tracking) | Real-time přehled během eventu. |
| Monitoring | **Sentry** | Aby host neviděl whitescreen tichouček. |

### 5.2 Architektura — proč server-trust

Klient **nikdy** nevidí:
- Správné odpovědi otázek (jen IDs odpovědí).
- Plain-text kódy stanovišť (jen hash / server-side check).
- Admin endpointy.

Klient posílá:
- `POST /api/stations/[id]/unlock` s kódem → server validuje → vrací otázku.
- `POST /api/questions/[id]/answer` s answer_id → server uloží + vrátí correct: true/false.

Bez tohohle by mohl kdokoli v dev tools vidět odpovědi a hra ztrácí smysl.

### 5.3 Datový model (Supabase / Postgres)

```sql
-- users (participants)
create table participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  consent_marketing boolean default false,
  session_token text unique not null,   -- jednoduchá auth bez hesla
  created_at timestamptz default now(),
  ip inet,
  user_agent text
);
create index on participants (email);

-- stations
create table stations (
  id int primary key,                   -- 1..4 (číslo viditelné hostovi)
  name text not null,
  emoji text,
  code_hash text not null,              -- bcrypt nebo argon2 hash kódu
  order_index int not null
);

-- questions (1:1 se station)
create table questions (
  id uuid primary key default gen_random_uuid(),
  station_id int references stations(id) on delete cascade,
  text text not null,
  emoji text
);

-- answers (variants per question)
create table answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references questions(id) on delete cascade,
  text text not null,
  is_correct boolean not null default false,
  order_index int                       -- pro deterministické pořadí, jinak random
);

-- progress tracking
create table participant_progress (
  participant_id uuid references participants(id) on delete cascade,
  station_id int references stations(id),
  unlocked_at timestamptz,              -- kdy zadal správný kód
  answered_at timestamptz,
  selected_answer_id uuid references answers(id),
  is_correct boolean,
  primary key (participant_id, station_id)
);

-- drawing / slosovani entries
create view eligible_for_drawing as
  select p.id, p.name, p.email, p.phone
  from participants p
  where (
    select count(*) from participant_progress pp
    where pp.participant_id = p.id and pp.is_correct = true
  ) = (select count(*) from stations);
```

**Row Level Security:**
- `participants`: insert anonymous OK; select/update jen vlastní řádek přes session_token.
- `stations` / `questions` / `answers`: select OK (text + ID), ale answer.is_correct **filtrován v API** (nikdy v RLS-povoleném selectu z klienta).
- `participant_progress`: insert/update přes server API only.

### 5.4 PWA / offline

- `manifest.json` s ADF brandingem, install prompt na iOS/Android.
- Service worker: precache statiky, cache-first pro fonts, network-first pro `/api/*`.
- Offline fallback: pokud host ztratí signál, journey overview funguje z cache, ale answer/unlock requeue na network return.

### 5.5 Admin

Samostatná routa `/admin`:
- Auth: Supabase magic-link na whitelisted ADF e-maily (např. `*@analyticsdf.com`).
- Sekce:
  1. **Live dashboard** (realtime přes Supabase): počet účastníků, počet completed, top progress, „people stuck on station 2" (může pomoci s organizací)
  2. **Účastníci** — tabulka, export CSV, filtr completed
  3. **Otázky** — CRUD, edit textu, edit odpovědí, mark correct
  4. **Stanoviště** — CRUD, generování kódů, generování QR kódů ke stažení (PDF s velkým „Stanoviště 01" + QR + kód)
  5. **Slosování** — tlačítko „Vylosuj výherce" (deterministic random + log do DB, aby šlo dohledat)
  6. **Settings** — texty obrazovek, datum/čas slosování, branding override

---

## 6. Bezpečnost & anti-cheat

| Riziko | Mitigace |
|---|---|
| Host vidí v DevTools správné odpovědi | Server-only validace, klient nikdy nedostane `is_correct` před odpovědí. |
| Host kopíruje kód stanoviště kamarádovi přes WhatsApp | OK pro tento usecase (party, ne soutěž o milion). Pokud bychom chtěli, můžeme přidat geolocation check (~50m radius od stanoviště). |
| Brute-force kódů | Rate limit 5 pokusů / minuta per IP+participant na `/api/stations/*/unlock`. |
| Brute-force odpovědí (klik všech tří dokud nevyjde) | Server zaznamenává **první** klik, další klik na danou otázku ignoruje (UI taky disabled po answer). |
| Vícenásobná účast jednoho člověka pro víc tiketů do slosování | Email uniqueness na DB úrovni, ale připustíme „one-shot per email". |
| Útok bot armádou na finish line | Cloudflare Turnstile na identifikační formuláři. |
| GDPR | Privacy policy + consent checkbox, data retention 90 dnů, smazat po slosování (kromě výherců, dokud nepřevezmou cenu). |

---

## 7. Roadmap / fáze

| # | Fáze | Co se udělá | Čas (odhad) |
|---|---|---|---|
| 1 | **Discovery & design alignment** | Schválení tohohle dokumentu, finalizace brand colors, vyjasnění otevřených otázek. | 1–2 dny |
| 2 | **Foundation** | Next.js setup, Tailwind, Supabase project, DB schema, deploy pipeline. | 1 den |
| 3 | **Design system** | Komponenty (Button, Card, Input, ProgressBar), motion presets, dark theme. | 1–2 dny |
| 4 | **Public flow** | Landing → onboarding → identita → journey → unlock → otázka → feedback → finish. | 3–4 dny |
| 5 | **Admin** | Auth, CRUD, exporty, QR generátor, live dashboard. | 2 dny |
| 6 | **PWA + polish** | Manifest, SW, ikony, splash, sound, haptics, konfety, animace tuning. | 1 den |
| 7 | **Bezpečnost & resilience** | Rate limits, Turnstile, error boundaries, Sentry, fallback UI. | 1 den |
| 8 | **Testing** | E2E (Playwright), mobile device testing (iOS Safari, Android Chrome), load test 100 souběžných hostů. | 1 den |
| 9 | **Pre-event dry run** | Tisk QR pro stanoviště, dry-run s 3–5 lidmi z ADF, finalizace textů. | 0.5 dne |
| 10 | **Event support** | Standby v den eventu (admin dashboard + možnost rychlých změn). | 1 den |

**Celkem hrubý odhad:** ~12–14 člověko-dnů pro top-tier verzi. Pokud zúžíme scope (např. admin minimal, bez PWA, bez exportů), dá se zkrátit na ~6–7 dnů.

---

## 8. Co potřebuju od tebe (otevřené otázky)

Otázky, na které potřebuju odpověď pro další krok — viz `QUESTIONS.md`. Highlighty:

1. **Marketingová pozvánka** — pošli prosím ten obrázek (`082_2026_ADF_210x99...jpg`) sem do chatu nebo do `assets/`. Z lokálního Macu k němu nemám přístup. Použiju ho jako vizuální referenci pro brand direction.
2. **Brand guide** — máš oficiální barvy / fonty ADF? V paměti mám placeholder hodnoty, chci to verify.
3. **Počet a typ cen ve slosování** — ovlivní finish screen.
4. **Kolik účastníků očekáváš?** — pro sizing infra (50? 200? 500?).
5. **Wi-Fi v lokaci** — bude tam stabilní síť, nebo počítat s LTE/offline first?
6. **Mám pokračovat rovnou implementací**, nebo nejdřív udělat clickable prototyp v Figmě (nebo Next.js sandbox bez backendu)?

---

## 9. Co dodá Claude v dalším kroku (jakmile odsouhlasíš)

1. Inicializace Next.js projektu + commit hygiene.
2. Supabase setup (schema migration).
3. **Tunable demo URL** během 2 dnů — landing + journey + jeden plně funkční flow stanoviště.
4. Iterace na základě tvé zpětné vazby.

---

*Tenhle dokument je živý. Komentuj přímo do souboru nebo do chatu — verzuji v gitu jakmile projekt založím.*
