import rawBank from "./question-bank.json";

export const slots = ["goal", "worlds", "scope", "toolkit", "spice"] as const;
export type Slot = (typeof slots)[number];
export type Question = { id: string; slot: Slot; prompt: string; detailPrompt: string; suggestions?: string[] };
export type TimeBudget = "evening" | "48h" | "week";
export type TeamSize = "solo" | "2-3" | "4+";
export type SlotAnswer =
  | { slot: "goal"; goal: string; note?: string }
  | { slot: "worlds"; domains: string[]; note?: string }
  | { slot: "scope"; timeBudget: TimeBudget; teamSize: TeamSize; note?: string }
  | { slot: "toolkit"; skills: string[]; avoid?: string; note?: string }
  | { slot: "spice"; spice: 1 | 2 | 3 | 4; twistNote?: string };
export type InterviewAnswers = {
  goal: string;
  domains: string[];
  timeBudget: TimeBudget;
  teamSize: TeamSize;
  skills: string[];
  avoid?: string;
  spice: 1 | 2 | 3 | 4;
  twistNote?: string;
  notes?: Partial<Record<"goal" | "worlds" | "scope" | "toolkit", string>>;
  questionIds: [string, string, string, string, string];
};
export type Draft = {
  schemaVersion: 2;
  questionIds: [string, string, string, string, string];
  order: [Slot, Slot, Slot, Slot, Slot];
  answers: Partial<Record<Slot, SlotAnswer>>;
  currentIndex: number;
  editingSlot?: Slot;
};

export const goalLabels: Record<string, string> = {
  solve: "fix an annoyance", learn: "learn a tool", impress: "impress judges",
  laugh: "make friends laugh", portfolio: "build a portfolio piece", community: "help a group",
  money: "test a business", experiment: "try a weird experiment", surprise: "surprise me",
};
export const domainLabels: Record<string, string> = {
  games: "games", climate: "climate", health: "health", education: "education", local: "local life",
  art: "art", finance: "money", productivity: "productivity", food: "food", music: "music",
  sports: "sports", accessibility: "accessibility", civic: "civic life", travel: "travel",
  science: "science", entertainment: "entertainment", any: "surprise me",
};
export const skillCatalog = ["TypeScript", "JavaScript", "Python", "React", "Node", "SQL", "design", "hardware", "mobile", "no-code", "AI API", "mapping", "data viz", "games", "Figma", "spreadsheets", "web", "local data", "sensors", "UI", "backend", "storytelling", "integrations", "frontend", "ML", "domain knowledge", "research", "writing", "data", "maps"];
export const spiceLabels = ["sensible", "quirky", "spicy", "unhinged"] as const;
export const timeLabels: Record<TimeBudget, string> = { evening: "one evening", "48h": "48 hours", week: "one week" };
export const teamLabels: Record<TeamSize, string> = { solo: "solo", "2-3": "2–3 people", "4+": "4+ people" };

function isSlot(value: string): value is Slot { return slots.includes(value as Slot); }
export const bank: Question[] = rawBank.map(row => {
  if (!isSlot(row.slot)) throw new Error(`Invalid question slot: ${row.id}`);
  return { id: row.id, slot: row.slot, prompt: row.prompt, detailPrompt: row.detailPrompt, ...( "suggestions" in row ? { suggestions: row.suggestions } : {}) };
});
if (bank.length !== 50 || new Set(bank.map(q => q.id)).size !== 50 || slots.some(slot => bank.filter(q => q.slot === slot).length !== 10)) {
  throw new Error("Question bank must contain ten unique questions in each of five slots.");
}
export const questionById = new Map(bank.map(question => [question.id, question]));

function randomIndex(length: number): number {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0] % length;
}

function readHistory(): string[][] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem("bodge-question-history-v1") || "[]");
    return Array.isArray(parsed) ? parsed.filter(row => Array.isArray(row) && row.every(id => typeof id === "string")).slice(-2) : [];
  } catch { return []; }
}

export function selectQuestions(): [string, string, string, string, string] {
  const history = readHistory();
  const selected = slots.map(slot => {
    const pool = bank.filter(question => question.slot === slot);
    const recent = new Set(history.flat());
    const eligible = pool.filter(question => !recent.has(question.id));
    return (eligible.length ? eligible : pool)[randomIndex(eligible.length || pool.length)].id;
  }) as [string, string, string, string, string];
  try { localStorage.setItem("bodge-question-history-v1", JSON.stringify([...history, selected].slice(-2))); } catch {}
  return selected;
}

export function startDraft(): Draft {
  const order: [Slot, Slot, Slot, Slot, Slot] = randomIndex(2)
    ? ["worlds", "goal", "scope", "toolkit", "spice"]
    : ["goal", "worlds", "scope", "toolkit", "spice"];
  if (randomIndex(2)) [order[2], order[3]] = [order[3], order[2]];
  return { schemaVersion: 2, questionIds: selectQuestions(), order, answers: {}, currentIndex: 0 };
}
export function currentSlot(draft: Draft): Slot | undefined { return draft.editingSlot ?? draft.order[draft.currentIndex]; }
export function completedCount(draft: Draft): number { return slots.filter(slot => draft.answers[slot]).length; }
export function answerSummary(answer: SlotAnswer): string {
  const withNote = (summary: string) => answer.slot !== "spice" && answer.note ? `${summary} · ${answer.note}` : summary;
  switch (answer.slot) {
    case "goal": return withNote(goalLabels[answer.goal] ?? answer.goal);
    case "worlds": return withNote(answer.domains.map(value => domainLabels[value] ?? value).join(" × "));
    case "scope": return withNote(`${timeLabels[answer.timeBudget]} · ${teamLabels[answer.teamSize]}`);
    case "toolkit": return withNote(answer.skills.length ? answer.skills.join(", ") : "no preference");
    case "spice": return spiceLabels[answer.spice - 1] + (answer.twistNote ? ` · ${answer.twistNote}` : "");
  }
}

export function normalizeAnswers(draft: Draft): InterviewAnswers | null {
  const goal = draft.answers.goal;
  const worlds = draft.answers.worlds;
  const scope = draft.answers.scope;
  const toolkit = draft.answers.toolkit;
  const spice = draft.answers.spice;
  if (goal?.slot !== "goal" || worlds?.slot !== "worlds" || scope?.slot !== "scope" || toolkit?.slot !== "toolkit" || spice?.slot !== "spice") return null;
  const notes = Object.fromEntries(([goal, worlds, scope, toolkit] as const).filter(answer => Boolean(answer.note)).map(answer => [answer.slot, answer.note])) as InterviewAnswers["notes"];
  return { goal: goal.goal, domains: worlds.domains, timeBudget: scope.timeBudget, teamSize: scope.teamSize, skills: toolkit.skills, ...(toolkit.avoid ? { avoid: toolkit.avoid } : {}), spice: spice.spice, ...(spice.twistNote ? { twistNote: spice.twistNote } : {}), ...(notes && Object.keys(notes).length ? { notes } : {}), questionIds: draft.questionIds };
}

export function saveDraft(draft: Draft | null): void {
  try { if (draft) localStorage.setItem("bodge-draft-v1", JSON.stringify(draft)); else localStorage.removeItem("bodge-draft-v1"); } catch {}
}

function safeText(value: unknown): value is string { return typeof value === "string" && value.length <= 200; }
function validAnswer(slot: Slot, value: unknown): value is SlotAnswer {
  if (!value || typeof value !== "object" || (value as {slot?: unknown}).slot !== slot) return false;
  const answer = value as Record<string, unknown>;
  if (answer.note !== undefined && !safeText(answer.note)) return false;
  if (slot === "goal") return safeText(answer.goal) && answer.goal.length > 0;
  if (slot === "worlds") return Array.isArray(answer.domains) && answer.domains.length > 0 && answer.domains.length <= 2 && answer.domains.every(item => safeText(item) && item.length > 0);
  if (slot === "scope") return ["evening", "48h", "week"].includes(String(answer.timeBudget)) && ["solo", "2-3", "4+"].includes(String(answer.teamSize));
  if (slot === "toolkit") return Array.isArray(answer.skills) && answer.skills.length <= 30 && answer.skills.every(item => safeText(item) && item.length > 0) && (answer.avoid === undefined || safeText(answer.avoid));
  return [1, 2, 3, 4].includes(Number(answer.spice)) && (answer.twistNote === undefined || safeText(answer.twistNote));
}

export function loadDraft(): Draft | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem("bodge-draft-v1") || "null");
    if (!parsed || typeof parsed !== "object") return null;
    const stored = parsed as Draft | (Omit<Draft, "order" | "schemaVersion"> & { schemaVersion: 1 });
    if (stored.schemaVersion !== 1 && stored.schemaVersion !== 2) return null;
    const draft: Draft = stored.schemaVersion === 1 ? { ...stored, schemaVersion: 2, order: [...slots] } : stored;
    if (!Array.isArray(draft.questionIds) || draft.questionIds.length !== 5 || !draft.questionIds.every((id, index) => questionById.get(id)?.slot === slots[index]) || !Array.isArray(draft.order) || draft.order.length !== 5 || !draft.order.every((slot, index) => slot === "spice" ? index === 4 : isSlot(slot)) || new Set(draft.order).size !== 5 || !Number.isInteger(draft.currentIndex) || draft.currentIndex < 0 || draft.currentIndex > 5 || !draft.answers || typeof draft.answers !== "object" || (draft.editingSlot && !isSlot(draft.editingSlot))) return null;
    if (draft.order.some((slot, index) => index < draft.currentIndex ? !validAnswer(slot, draft.answers[slot]) : draft.answers[slot] !== undefined && !validAnswer(slot, draft.answers[slot]))) return null;
    if (draft.editingSlot && !validAnswer(draft.editingSlot, draft.answers[draft.editingSlot])) return null;
    return draft;
  } catch { return null; }
}
