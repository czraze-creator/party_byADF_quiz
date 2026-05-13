import type { Question, Station } from "../types";

export const SEED_STATIONS: Station[] = [
  {
    id: 1,
    name: "Raut",
    emoji: "🍽️",
    hint: "Kde to celý začíná — u jídla.",
    code: "ALFA",
    orderIndex: 1,
  },
  {
    id: 2,
    name: "Bar",
    emoji: "🍸",
    hint: "Tam, kde se debatuje nejlíp.",
    code: "TONIC",
    orderIndex: 2,
  },
  {
    id: 3,
    name: "Fotokoutek",
    emoji: "📸",
    hint: "Vzpomínka, kterou si vezmeš domů.",
    code: "FLASH",
    orderIndex: 3,
  },
  {
    id: 4,
    name: "Vyhlídka",
    emoji: "🥃",
    hint: "Degustace u Karla. Finále.",
    code: "SUMMIT",
    orderIndex: 4,
  },
];

export const SEED_QUESTIONS: Question[] = [
  {
    id: "q1",
    stationId: 1,
    text: "Kde v Praze má ADF kancelář?",
    emoji: "🏢",
    answers: [
      { id: "q1a1", text: "Pankrác", isCorrect: true },
      { id: "q1a2", text: "Florenc", isCorrect: false },
      { id: "q1a3", text: "Náměstí Republiky", isCorrect: false },
    ],
  },
  {
    id: "q2",
    stationId: 2,
    text: "Kdo je CEO ADF?",
    emoji: "👔",
    answers: [
      { id: "q2a1", text: "Kamil Mahdal", isCorrect: true },
      { id: "q2a2", text: "Lenka Mahdal", isCorrect: false },
      { id: "q2a3", text: "Karel Mahdal", isCorrect: false },
    ],
  },
  {
    id: "q3",
    stationId: 3,
    text: "Jaká služba chybí ve výběru: Datová řešení, Cyber security, IT support, IT contracting?",
    emoji: "🤖",
    answers: [
      { id: "q3a1", text: "AI automatizace", isCorrect: true },
      { id: "q3a2", text: "Cloudová infrastruktura", isCorrect: false },
      { id: "q3a3", text: "Vývoj softwaru", isCorrect: false },
    ],
  },
  {
    id: "q4",
    stationId: 4,
    text: "Kolik let slaví ADF?",
    emoji: "🎉",
    answers: [
      { id: "q4a1", text: "10", isCorrect: true },
      { id: "q4a2", text: "15", isCorrect: false },
      { id: "q4a3", text: "20", isCorrect: false },
    ],
  },
];
