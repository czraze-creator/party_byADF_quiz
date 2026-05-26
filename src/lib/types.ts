export type StationId = 1 | 2 | 3 | 4;

export type Station = {
  id: StationId;
  name: string;
  emoji: string;
  hint: string;
  code: string; // plaintext, server-only — never sent to client
  orderIndex: number;
};

export type Answer = {
  id: string;
  text: string;
  isCorrect: boolean; // server-only — never sent to client
};

export type Question = {
  id: string;
  stationId: StationId;
  text: string;
  emoji: string;
  answers: Answer[];
};

export type Participant = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  consentMarketing: boolean;
  sessionToken: string;
  createdAt: string;
};

export type StationProgress = {
  participantId: string;
  stationId: StationId;
  unlockedAt: string | null;
  answeredAt: string | null;
  selectedAnswerId: string | null;
  isCorrect: boolean | null;
};

// Public-safe DTOs (no secret fields)

export type PublicStation = {
  id: StationId;
  name: string;
  emoji: string;
  hint: string;
  orderIndex: number;
  codeLength: number;
};

export type PublicAnswer = {
  id: string;
  text: string;
};

export type PublicQuestion = {
  id: string;
  stationId: StationId;
  text: string;
  emoji: string;
  answers: PublicAnswer[];
};

export type PublicProgress = {
  stationId: StationId;
  state: "locked" | "unlocked" | "completed";
  isCorrect: boolean | null;
};
