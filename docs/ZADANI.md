# Zadání — Interaktivní QR Quiz pro Party byADF 2026

> Originální zadání od Aleše (zachováno doslova). Změna oproti původnímu zadání: **mapa areálu není k dispozici**, řešení musí fungovat bez ní.

## Cíl projektu

Vytvořit jednoduchou, zábavnou a intuitivní webovou quizovou aplikaci pro event ByADF, která:

- motivuje účastníky pohybovat se mezi stanovišti,
- propojuje fyzický event s digitální interakcí,
- funguje přes mobil bez instalace aplikace,
- umožní jednoduché vyhodnocení správných odpovědí,
- automaticky zařadí úspěšné účastníky do slosování.

Primární důraz:
- jednoduchost použití,
- rychlost,
- minimální technické komplikace,
- dobrý UX flow během eventu,
- **vizuálně „wow" — prodat ADF jako top dodavatele**.

## Stanoviště na eventu (potvrzeno 2026-05-13)

| # | Stanoviště | Otázka | Emoji |
|---|---|---|---|
| 1 | **Raut** | Otázka 1 — Kancelář ADF | 🏢 |
| 2 | **Bar** | Otázka 2 — CEO ADF | 👔 |
| 3 | **Fotokoutek** | Otázka 3 — AI automatizace | 🤖 |
| 4 | **Vyhlídka (degustace u Karla)** | Otázka 4 — 10 let ADF | 🎉 |

> Mapování otázek na stanoviště je iniciální návrh — můžeš přehodit. Doporučuji nechat „10 let" na vyhlídce (Karel je punktem eventu, finální stanoviště = silný moment).

## High-level koncept

1. Účastník načte QR kód.
2. Otevře se webová aplikace.
3. Zobrazí se úvodní obrazovka a přehled stanovišť (mapa není, viz Návrh řešení).
4. Účastník přijde na stanoviště.
5. Na stanovišti zadá unikátní kód.
6. Odemkne se otázka.
7. Vybere odpověď (multiple choice, klik = potvrzení).
8. Po odpovědi se vrátí na přehled.
9. Pokračuje na další stanoviště.
10. Po správném zodpovězení všech otázek je zařazen do slosování.

## Identifikace uživatele

Na začátku:
- jméno
- e-mail

Volitelně:
- telefon

## Feedback odpovědí

- Správně → zelené zvýraznění
- Špatně → červené zvýraznění
- Bez tlačítka „Odeslat" — klik = potvrzení

## První sada otázek

### Otázka 1 🏢
**Kde v Praze má ADF kancelář?**
- ✅ Pankrác
- Florenc
- Náměstí Republiky

### Otázka 2 👔
**Kdo je CEO ADF?**
- ✅ Kamil Mahdal
- Lenka Mahdal
- Karel Mahdal

### Otázka 3 🤖
**Jaká služba chybí ve výběru: Datová řešení, Cyber security, IT support, IT contracting?**
- ✅ AI automatizace
- Cloudová infrastruktura
- Vývoj softwaru

### Otázka 4 🎉
**Kolik let slaví ADF?**
- ✅ 10
- 15
- 20

## Admin část

- správa otázek
- správa stanovišť
- export výsledků (CSV)
- seznam účastníků
- editace správných odpovědí

## Doporučená technická architektura (z původního briefu)

- **Frontend:** React, Next.js, Tailwind
- **Backend:** Node.js, Supabase / Firebase

## Databázové entity

- `users` (id, name, email)
- `stations` (id, name, code)
- `questions` (id, station_id, question, answers[], correct_answer)
- `user_answers` (user_id, question_id, selected_answer, correct)

## Future features (nice-to-have, ne v MVP)

- AI validace textových odpovědí
- leaderboard
- časový limit
- realtime statistiky
- bonusové hidden questions
- pokročilý admin dashboard
- heatmapa pohybu účastníků
