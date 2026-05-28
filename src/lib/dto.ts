import type {
  PublicQuestion,
  PublicStation,
  Question,
  Station,
} from "./types";

export function toPublicStation(s: Station): PublicStation {
  return {
    id: s.id,
    name: s.name,
    emoji: s.emoji,
    hint: s.hint,
    orderIndex: s.orderIndex,
    codeLength: s.code.length,
  };
}

export function toPublicQuestion(q: Question): PublicQuestion {
  return {
    id: q.id,
    stationId: q.stationId,
    text: q.text,
    emoji: q.emoji,
    answers: q.answers.map((a) => ({ id: a.id, text: a.text })),
  };
}

// Deterministic shuffle so a user sees consistent answer ordering across
// refreshes, while still varying positions across questions.
//
// Uses xmur3 (hash) + mulberry32 (PRNG) — both well-distributed for small
// inputs. The previous glibc-style LCG had a weak low bit which biased
// the result for 3-element arrays (correct answer never landed at index 0).
export function shuffle<T>(arr: T[], seed: string): T[] {
  const rand = mulberry32(xmur3(seed));
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function xmur3(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h ^= h >>> 16;
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
