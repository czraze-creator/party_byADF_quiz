// Czech vocative case for addressing guests by first name.
//
// Strategy:
//   1. Take only the first word of the full name.
//   2. Look it up in a curated dictionary of common Czech names.
//   3. Fall back to a conservative heuristic (female-style -a → -o).
//   4. If nothing matches, return the name unchanged — "Ahoj, Petr." is
//      acceptable; "Ahoj, Petřo." is not. We prefer no transformation
//      over an obviously wrong one.

const VOCATIVES: Record<string, string> = {
  // ── Male ─────────────────────────────────────────────────────────────
  adam: "Adame",
  aleš: "Aleši",
  antonín: "Antoníne",
  daniel: "Danieli",
  david: "Davide",
  dominik: "Dominiku",
  filip: "Filipe",
  františek: "Františku",
  honza: "Honzo",
  ivan: "Ivane",
  jakub: "Jakube",
  jan: "Jane",
  jaroslav: "Jaroslave",
  jindřich: "Jindřichu",
  jiří: "Jiří",
  josef: "Josefe",
  kamil: "Kamile",
  karel: "Karle",
  kryštof: "Kryštofe",
  libor: "Libore",
  ladislav: "Ladislave",
  lukáš: "Lukáši",
  marek: "Marku",
  martin: "Martine",
  matěj: "Matěji",
  matouš: "Matouši",
  michal: "Michale",
  milan: "Milane",
  miroslav: "Miroslave",
  ondra: "Ondro",
  ondřej: "Ondřeji",
  oto: "Oto",
  patrik: "Patriku",
  pavel: "Pavle",
  pepa: "Pepo",
  petr: "Petře",
  radek: "Radku",
  radim: "Radime",
  radomír: "Radomíre",
  richard: "Richarde",
  robert: "Roberte",
  roman: "Romane",
  rudolf: "Rudolfe",
  stanislav: "Stanislave",
  šimon: "Šimone",
  štěpán: "Štěpáne",
  tobiáš: "Tobiáši",
  tomáš: "Tomáši",
  václav: "Václave",
  viktor: "Viktore",
  vít: "Víte",
  vladimír: "Vladimíre",
  vojtěch: "Vojtěchu",
  zdeněk: "Zdeňku",

  // ── Female ───────────────────────────────────────────────────────────
  adéla: "Adélo",
  alena: "Aleno",
  alžběta: "Alžběto",
  andrea: "Andreo",
  aneta: "Aneto",
  anežka: "Anežko",
  anna: "Anno",
  barbora: "Barboro",
  bára: "Báro",
  beáta: "Beáto",
  blanka: "Blanko",
  dana: "Dano",
  daniela: "Danielo",
  denisa: "Deniso",
  eliška: "Eliško",
  ester: "Ester",
  eva: "Evo",
  gabriela: "Gabrielo",
  hana: "Hano",
  helena: "Heleno",
  ilona: "Ilono",
  irena: "Ireno",
  iva: "Ivo",
  ivana: "Ivano",
  jana: "Jano",
  jaroslava: "Jaroslavo",
  jitka: "Jitko",
  julie: "Julie",
  karolína: "Karolíno",
  kateřina: "Kateřino",
  klára: "Kláro",
  kristýna: "Kristýno",
  květa: "Květo",
  lenka: "Lenko",
  linda: "Lindo",
  lucia: "Lucio",
  lucie: "Lucie",
  ludmila: "Ludmilo",
  magda: "Magdo",
  magdaléna: "Magdaléno",
  marcela: "Marcelo",
  marie: "Marie",
  markéta: "Markéto",
  marta: "Marto",
  martina: "Martino",
  michaela: "Michaelo",
  miroslava: "Miroslavo",
  monika: "Moniko",
  natálie: "Natálie",
  nela: "Nelo",
  nikola: "Nikolo",
  olga: "Olgo",
  pavla: "Pavlo",
  pavlína: "Pavlíno",
  petra: "Petro",
  radka: "Radko",
  renáta: "Renáto",
  romana: "Romano",
  růžena: "Růženo",
  sandra: "Sandro",
  saša: "Sašo",
  silvie: "Silvie",
  simona: "Simono",
  sofie: "Sofie",
  soňa: "Soňo",
  stanislava: "Stanislavo",
  šárka: "Šárko",
  štěpánka: "Štěpánko",
  tereza: "Terezo",
  vendula: "Vendulo",
  věra: "Věro",
  veronika: "Veroniko",
  viktorie: "Viktorie",
  vlasta: "Vlasto",
  zdena: "Zdeno",
  zdeňka: "Zdeňko",
  zuzana: "Zuzano",
};

function titleCase(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Returns the Czech vocative form of a first name. Only operates on the
 * first whitespace-separated token of the input, so callers can pass
 * either a first name or a full "Jméno Příjmení".
 */
export function vocative(name: string): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return trimmed;
  const first = trimmed.split(/\s+/)[0];
  const lower = first.toLowerCase();

  const dictValue = VOCATIVES[lower];
  if (dictValue) return dictValue;

  // Conservative heuristic: most female names ending in -a take -o.
  // We don't try to handle masculine consonant rules here — too many
  // exceptions, and an obvious miss reads worse than no transformation.
  if (/a$/i.test(first) && first.length > 2) {
    return titleCase(first.slice(0, -1) + "o");
  }

  return titleCase(first);
}
