import { nanoid } from "nanoid";
import type {
  Answer,
  Participant,
  Question,
  Station,
  StationId,
  StationProgress,
} from "../types";
import { getSupabaseAdmin } from "../supabase/server";

// ---------------------------------------------------------------------
// Row → domain object mappers (DB uses snake_case, TS uses camelCase)
// ---------------------------------------------------------------------

type StationRow = {
  id: number;
  name: string;
  emoji: string;
  hint: string;
  code: string;
  order_index: number;
};

type QuestionRow = {
  id: string;
  station_id: number;
  text: string;
  emoji: string;
};

type AnswerRow = {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
};

type ParticipantRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  consent_marketing: boolean;
  session_token: string;
  created_at: string;
};

type ProgressRow = {
  participant_id: string;
  station_id: number;
  unlocked_at: string | null;
  answered_at: string | null;
  selected_answer_id: string | null;
  is_correct: boolean | null;
};

function mapStation(r: StationRow): Station {
  return {
    id: r.id as StationId,
    name: r.name,
    emoji: r.emoji,
    hint: r.hint,
    code: r.code,
    orderIndex: r.order_index,
  };
}

function mapAnswer(r: AnswerRow): Answer {
  return { id: r.id, text: r.text, isCorrect: r.is_correct };
}

function mapParticipant(r: ParticipantRow): Participant {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    consentMarketing: r.consent_marketing,
    sessionToken: r.session_token,
    createdAt: r.created_at,
  };
}

function mapProgress(r: ProgressRow): StationProgress {
  return {
    participantId: r.participant_id,
    stationId: r.station_id as StationId,
    unlockedAt: r.unlocked_at,
    answeredAt: r.answered_at,
    selectedAnswerId: r.selected_answer_id,
    isCorrect: r.is_correct,
  };
}

// ---------------------------------------------------------------------
// Stations & questions (read-only static data)
// ---------------------------------------------------------------------

export async function listStations(): Promise<Station[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("stations")
    .select("*")
    .order("order_index", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapStation);
}

export async function getStation(id: StationId): Promise<Station | null> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("stations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapStation(data) : null;
}

async function loadQuestion(row: QuestionRow | null): Promise<Question | null> {
  if (!row) return null;
  const sb = getSupabaseAdmin();
  const { data: answers, error } = await sb
    .from("answers")
    .select("*")
    .eq("question_id", row.id);
  if (error) throw error;
  return {
    id: row.id,
    stationId: row.station_id as StationId,
    text: row.text,
    emoji: row.emoji,
    answers: (answers ?? []).map(mapAnswer),
  };
}

export async function getQuestionForStation(
  stationId: StationId,
): Promise<Question | null> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("questions")
    .select("*")
    .eq("station_id", stationId)
    .maybeSingle();
  if (error) throw error;
  return loadQuestion(data);
}

export async function getQuestion(id: string): Promise<Question | null> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("questions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return loadQuestion(data);
}

// ---------------------------------------------------------------------
// Participants
// ---------------------------------------------------------------------

export async function findParticipantByEmail(
  email: string,
): Promise<Participant | null> {
  const sb = getSupabaseAdmin();
  const normalized = email.trim().toLowerCase();
  const { data, error } = await sb
    .from("participants")
    .select("*")
    .eq("email", normalized)
    .maybeSingle();
  if (error) throw error;
  return data ? mapParticipant(data) : null;
}

export async function findParticipantBySession(
  token: string,
): Promise<Participant | null> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("participants")
    .select("*")
    .eq("session_token", token)
    .maybeSingle();
  if (error) throw error;
  return data ? mapParticipant(data) : null;
}

export async function createParticipant(input: {
  name: string;
  email: string;
  phone?: string | null;
  consentMarketing: boolean;
}): Promise<Participant> {
  const sb = getSupabaseAdmin();
  const row: ParticipantRow = {
    id: nanoid(12),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    consent_marketing: input.consentMarketing,
    session_token: nanoid(32),
    created_at: new Date().toISOString(),
  };
  const { data, error } = await sb
    .from("participants")
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return mapParticipant(data);
}

// ---------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------

export async function getProgress(
  participantId: string,
): Promise<StationProgress[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("progress")
    .select("*")
    .eq("participant_id", participantId);
  if (error) throw error;
  return (data ?? []).map(mapProgress);
}

export async function upsertProgress(
  patch: StationProgress,
): Promise<StationProgress> {
  const sb = getSupabaseAdmin();
  const row: ProgressRow = {
    participant_id: patch.participantId,
    station_id: patch.stationId,
    unlocked_at: patch.unlockedAt,
    answered_at: patch.answeredAt,
    selected_answer_id: patch.selectedAnswerId,
    is_correct: patch.isCorrect,
  };
  const { data, error } = await sb
    .from("progress")
    .upsert(row, { onConflict: "participant_id,station_id" })
    .select("*")
    .single();
  if (error) throw error;
  return mapProgress(data);
}

export async function resetParticipantProgress(
  participantId: string,
): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("progress")
    .delete()
    .eq("participant_id", participantId);
  if (error) throw error;
}

// ---------------------------------------------------------------------
// Admin aggregate
// ---------------------------------------------------------------------

export async function listAllParticipantsWithProgress(): Promise<
  Array<Participant & { progress: StationProgress[]; completed: boolean }>
> {
  const sb = getSupabaseAdmin();
  const [
    { data: participants, error: pErr },
    { data: progress, error: prErr },
    { count: stationCount, error: sErr },
  ] = await Promise.all([
    sb.from("participants").select("*").order("created_at", { ascending: true }),
    sb.from("progress").select("*"),
    sb.from("stations").select("*", { count: "exact", head: true }),
  ]);
  if (pErr) throw pErr;
  if (prErr) throw prErr;
  if (sErr) throw sErr;

  const totalStations = stationCount ?? 0;
  const progressByParticipant = new Map<string, StationProgress[]>();
  for (const r of progress ?? []) {
    const mapped = mapProgress(r);
    const arr = progressByParticipant.get(mapped.participantId) ?? [];
    arr.push(mapped);
    progressByParticipant.set(mapped.participantId, arr);
  }

  return (participants ?? []).map((row) => {
    const p = mapParticipant(row);
    const own = progressByParticipant.get(p.id) ?? [];
    const correct = own.filter((x) => x.isCorrect === true).length;
    return { ...p, progress: own, completed: correct === totalStations };
  });
}
