import { promises as fs } from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import type {
  Participant,
  Question,
  Station,
  StationId,
  StationProgress,
} from "../types";
import { SEED_QUESTIONS, SEED_STATIONS } from "./seed";

type DbShape = {
  stations: Station[];
  questions: Question[];
  participants: Participant[];
  progress: StationProgress[];
};

const DATA_DIR =
  process.env.QUIZ_DATA_DIR ?? path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "quiz.json");

let memCache: DbShape | null = null;
let writeQueue: Promise<void> = Promise.resolve();

async function ensureLoaded(): Promise<DbShape> {
  if (memCache) return memCache;
  try {
    const buf = await fs.readFile(DATA_FILE, "utf8");
    memCache = JSON.parse(buf) as DbShape;
    let mutated = false;
    if (!memCache.stations?.length) {
      memCache.stations = SEED_STATIONS;
      mutated = true;
    }
    if (!memCache.questions?.length) {
      memCache.questions = SEED_QUESTIONS;
      mutated = true;
    }
    if (mutated) await persist();
    return memCache;
  } catch {
    memCache = {
      stations: SEED_STATIONS,
      questions: SEED_QUESTIONS,
      participants: [],
      progress: [],
    };
    await persist();
    return memCache;
  }
}

async function persist(): Promise<void> {
  if (!memCache) return;
  const snapshot = JSON.stringify(memCache, null, 2);
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, snapshot, "utf8");
  });
  await writeQueue;
}

export async function listStations(): Promise<Station[]> {
  const db = await ensureLoaded();
  return [...db.stations].sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function getStation(id: StationId): Promise<Station | null> {
  const db = await ensureLoaded();
  return db.stations.find((s) => s.id === id) ?? null;
}

export async function getQuestionForStation(
  stationId: StationId,
): Promise<Question | null> {
  const db = await ensureLoaded();
  return db.questions.find((q) => q.stationId === stationId) ?? null;
}

export async function getQuestion(id: string): Promise<Question | null> {
  const db = await ensureLoaded();
  return db.questions.find((q) => q.id === id) ?? null;
}

export async function findParticipantByEmail(
  email: string,
): Promise<Participant | null> {
  const db = await ensureLoaded();
  const normalized = email.trim().toLowerCase();
  return (
    db.participants.find((p) => p.email.toLowerCase() === normalized) ?? null
  );
}

export async function findParticipantBySession(
  token: string,
): Promise<Participant | null> {
  const db = await ensureLoaded();
  return db.participants.find((p) => p.sessionToken === token) ?? null;
}

export async function createParticipant(input: {
  name: string;
  email: string;
  phone?: string | null;
  consentMarketing: boolean;
}): Promise<Participant> {
  const db = await ensureLoaded();
  const participant: Participant = {
    id: nanoid(12),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    consentMarketing: input.consentMarketing,
    sessionToken: nanoid(32),
    createdAt: new Date().toISOString(),
  };
  db.participants.push(participant);
  await persist();
  return participant;
}

export async function getProgress(
  participantId: string,
): Promise<StationProgress[]> {
  const db = await ensureLoaded();
  return db.progress.filter((p) => p.participantId === participantId);
}

export async function upsertProgress(
  patch: StationProgress,
): Promise<StationProgress> {
  const db = await ensureLoaded();
  const idx = db.progress.findIndex(
    (p) =>
      p.participantId === patch.participantId &&
      p.stationId === patch.stationId,
  );
  if (idx === -1) {
    db.progress.push(patch);
  } else {
    db.progress[idx] = { ...db.progress[idx], ...patch };
  }
  await persist();
  return patch;
}

export async function resetParticipantProgress(
  participantId: string,
): Promise<void> {
  const db = await ensureLoaded();
  db.progress = db.progress.filter((p) => p.participantId !== participantId);
  await persist();
}

export async function listAllParticipantsWithProgress(): Promise<
  Array<Participant & { progress: StationProgress[]; completed: boolean }>
> {
  const db = await ensureLoaded();
  const stationCount = db.stations.length;
  return db.participants.map((p) => {
    const progress = db.progress.filter((x) => x.participantId === p.id);
    const correct = progress.filter((x) => x.isCorrect === true).length;
    return { ...p, progress, completed: correct === stationCount };
  });
}
