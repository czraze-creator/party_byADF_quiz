# Otevřené otázky — čekám na odpověď od Aleše

> Odpovědi mě odblokují pro další iteraci. Vyšší v seznamu = větší dopad na návrh.

## 🔴 Blokující (potřebuju před implementací)

1. **Vizuální podklady** — pošli prosím přes chat (nebo nahraj do `/home/aiauto/adf-party-quiz/assets/`):
   - `082_2026_ADF_210x99_pozvanka_10_let_04_HR.jpg` — marketingová pozvánka
   - `PARTY-BY-ADF-2026-HRACI-KARTA-A6.png` — hrací karta
   K tvému lokálnímu Macu (`/Users/alesvychodil/temp/`) nemám z tohoto Linux serveru přístup. Soubory potřebuju jako visual reference pro brand direction a aby quiz vizuálně navazoval na tištěné materiály.
2. **Brand guide ADF** — máš oficiální:
   - Barvy (přesné HEX/CMYK)? V paměti mám placeholder: navy `#0A2540`, cyan `#00B8D4`. Verify.
   - Typografii (font ADF)?
   - Tone of voice (tykání/vykání hostům)? Default volím **tykání** — neformální party.
3. **Doménový name & deploy** — kam to nasadit? `party.analyticsdf.com`? Vlastní doména (`partybyadf2026.cz`)? Nebo Vercel preview URL stačí?

## 🟡 Důležité (vlivnou na scope / UX)

4. **Datum & místo eventu** — pro countdown, branding, mapu (i bez mapy areálu mohu zmínit lokaci).
5. **Počet účastníků** — odhad pro infra sizing a UX rozhodnutí.
   - <50 → minimal infra, Vercel hobby tier OK
   - 50–200 → standard
   - 200+ → load test + Cloudflare + Supabase pro tier
6. **Wi-Fi v lokaci** — bude tam stabilní síť? Nebo počítat s LTE/offline-first robustness?
7. **Slosování** — kolik cen, jaké, kdy losování proběhne? Ovlivní finish screen + countdown.
8. ~~Počet otázek finální~~ ✅ **vyřešeno** — 4 stanoviště: raut, bar, fotokoutek, vyhlídka.
9. **Jazyková verze** — jen čeština? Nebo bilingvální CZ/EN (pro zahraniční hosty ADF)?
10. **GDPR / consent** — kdo poskytne text privacy policy + co se s e-maily děje po eventu (marketing list ano/ne)?

## 🟢 Nice-to-have (zlepší výsledek, ne blocker)

11. **Sound effects** — můžeme použít vlastní/licencované zvuky (krátké „pop", „success"), nebo držet visual-only?
12. **Easter eggs** — chcete tam schovat něco hravého? (5× tap na logo, konami code, hidden 5. otázku po dokončení…)
13. **Sdílení na social** — má smysl finish screen s šablonou „Right now in @ADF party!" obrázku pro Instagram stories?
14. **Post-event email** — chcete poslat účastníkům děkovný e-mail s recapem hry / fotkami z eventu?
15. **Multi-jazykové verze otázek** — pro výhled, ne pro letošek.

## 💬 Otevřené design otázky (rozhodneme v iteraci)

16. **Layout journey** — A (vertikální path ⭐), B (hex grid), C (carousel)?
17. **Pořadí otázek** — host musí jet 1→2→3→4, nebo libovolně? Default v návrhu = libovolně (lepší UX, host nemusí čekat na vytížené stanoviště).
18. **Wrong answer handling** — host smí zkusit znovu, nebo je „špatně" konečné (a tím vypadne ze slosování)? Default v návrhu = **konečné** (motivuje přemýšlet, fair pravidla).
19. **„Komu se daří" leaderboard během eventu?** — mohlo by to být fun side feature, ale i tlak na hosty. Skip pro MVP.
