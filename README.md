# Party byADF 2026 — Interactive Quiz

Webová PWA aplikace pro letní party byADF (červen 2026, 10. výročí ADF).
Hosté skenují QR kódy na 4 stanovištích (Raut · Bar · Fotokoutek · Vyhlídka),
odpovídají na otázky, po splnění jsou zařazeni do slosování.

## Status

🟢 **MVP hotové**, čeká se na review a brand-guide verify.

**Co funguje end-to-end:**

- Landing → Onboarding → Identita → Journey → Code unlock → Question → Feedback → Finish
- Server-trust validace (správné odpovědi nikdy v JS bundle)
- Per-user session cookie (httpOnly)
- Admin: login, live dashboard, CSV export, QR generátor pro tisk, slosování
- PWA manifest + ikony
- Lokální JSON store pro dev (bez závislosti na DB)

**Co je TODO před produkcí:**

- [ ] Verify ADF brand colors (aktuálně placeholder z paměti)
- [ ] Doplnit privacy policy text
- [ ] Migrace lokálního JSON store na Supabase (kvůli Vercel ephemeral FS)
- [ ] Rate limiting na API endpointech
- [ ] Cloudflare Turnstile na identita formuláři
- [ ] Tisk QR kódů + dry-run s pár hosty z ADF

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
# http://localhost:3000
```

**Admin:** `http://localhost:3000/admin` — heslo z `.env.local` (default `adf2026`).

**Reset dat:** `rm -rf .data/`

## Struktura

```
adf-party-quiz/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← landing
│   │   ├── play/
│   │   │   ├── onboarding/       ← 3-step intro
│   │   │   ├── identita/         ← jméno + email
│   │   │   ├── journey/          ← mission path
│   │   │   ├── station/[id]/     ← unlock + question
│   │   │   └── done/             ← finish + share
│   │   ├── admin/                ← admin UI
│   │   └── api/                  ← server-trust endpoints
│   ├── components/
│   │   ├── ui/                   ← Button, Card, Input, ProgressBar, CodeInput
│   │   ├── journey/              ← StationNode, JourneyView
│   │   └── feedback/             ← Confetti
│   └── lib/
│       ├── db/                   ← store (local JSON) + seed
│       ├── types.ts              ← shared types
│       ├── session.ts            ← participant session cookie
│       └── admin.ts              ← admin auth
├── public/
│   ├── brand/                    ← ADF loga
│   └── icons/                    ← PWA ikony
├── docs/
│   ├── ZADANI.md
│   ├── PROPOSAL.md               ← návrh řešení (live)
│   ├── QUESTIONS.md              ← otevřené otázky
│   └── DEPLOYMENT.md             ← deploy guide
└── assets/                       ← raw zdroje (pozvánka, hrací karta)
```

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion ·
canvas-confetti · qrcode · nanoid · PWA

## Stanoviště & otázky

| # | Lokace | Otázka | Kód |
|---|---|---|---|
| 1 | Raut 🍽️ | Kde má ADF kancelář? | `ALFA` |
| 2 | Bar 🍸 | Kdo je CEO ADF? | `TONIC` |
| 3 | Fotokoutek 📸 | Která služba chybí? | `FLASH` |
| 4 | Vyhlídka 🥃 | Kolik let slaví ADF? | `SUMMIT` |

(kódy lze upravit v `src/lib/db/seed.ts` před prvním spuštěním, nebo v `.data/quiz.json` poté)

## Další kroky

Viz `docs/QUESTIONS.md` pro otevřené otázky, `docs/DEPLOYMENT.md` pro deploy.
