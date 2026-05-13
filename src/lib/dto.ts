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

export function shuffle<T>(arr: T[], seed: string): T[] {
  // deterministic per-question shuffle so users see consistent ordering on refresh
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    const j = h % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
