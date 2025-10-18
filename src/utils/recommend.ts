// Minimal recommender: moods + text → tag matches + history boosts → score

import type { Card } from "@/types/card";

// LocalStorage keys
const LS_PREFS = "nuera:prefs:v1";
const LS_LAST_MOODS = "nuera:last_moods:v1";

export type MoodSignal = {
  moods: string[];   // selected bubbles
  text?: string;     // typed or transcribed
};

type Prefs = {
  // simple per card type likes (meditation, breathing, gratitude, etc.)
  typeScore: Record<string, number>;
};

// ---- persistence helpers

function loadPrefs(): Prefs {
  try { return JSON.parse(localStorage.getItem(LS_PREFS) || "{}") as Prefs; } catch { return { typeScore: {} }; }
}
function savePrefs(p: Prefs) {
  localStorage.setItem(LS_PREFS, JSON.stringify(p));
}

export function recordPositive(card: Card) {
  const p = loadPrefs();
  const t = card.type;
  p.typeScore[t] = (p.typeScore[t] || 0) + 1;
  savePrefs(p);
}

export function recordNegative(card: Card) {
  const p = loadPrefs();
  const t = card.type;
  p.typeScore[t] = (p.typeScore[t] || 0) - 0.5; // small penalty
  savePrefs(p);
}

export function setLastMoodSignal(sig: MoodSignal) {
  localStorage.setItem(LS_LAST_MOODS, JSON.stringify(sig));
}
export function getLastMoodSignal(): MoodSignal | null {
  try { return JSON.parse(localStorage.getItem(LS_LAST_MOODS) || "null"); } catch { return null; }
}

// ---- tag mapping

// Map mood bubble labels → intent tags
const MOOD_TO_TAGS: Record<string, string[]> = {
  anxious: ["calm","breath","mindfulness"],
  stressed: ["calm","breath","mindfulness"],
  sad: ["mindfulness","companion"],
  angry: ["calm","breath"],
  overwhelmed: ["calm","mindfulness","gratitude"],
  tired: ["sleep","calm"],
  wired: ["breath","calm"],
  unfocused: ["focus","mindfulness","breath"],
  grateful: ["gratitude","mindfulness"],
  okay: ["mindfulness"],
  happy: ["mindfulness","gratitude","energize"],
  lonely: ["companion","gratitude"],
};

// Minimal keyword mapping for free text
const TEXT_KEYWORDS: Array<{ rx: RegExp; tags: string[] }> = [
  { rx: /\b(anxious|anxiety|panic|worried)\b/i, tags: ["calm","breath","mindfulness"] },
  { rx: /\b(stress|stressed|overwhelm|pressure)\b/i, tags: ["calm","mindfulness","breath"] },
  { rx: /\b(sad|down|depressed|blue)\b/i, tags: ["companion","mindfulness"] },
  { rx: /\b(angry|rage|frustrat)\b/i, tags: ["calm","breath"] },
  { rx: /\b(tired|sleep|insomnia|awake)\b/i, tags: ["sleep","calm"] },
  { rx: /\b(focus|distract|procrast)\b/i, tags: ["focus","mindfulness","breath"] },
  { rx: /\b(grateful|thanks|appreciat)\b/i, tags: ["gratitude","mindfulness"] },
  { rx: /\b(lonely|alone)\b/i, tags: ["companion","gratitude"] },
];

function tagsFromMood(sig: MoodSignal): Record<string, number> {
  const weights: Record<string, number> = {};
  sig.moods.forEach(m => (MOOD_TO_TAGS[m?.toLowerCase()] || []).forEach(t => weights[t] = (weights[t] || 0) + 1));

  if (sig.text) {
    TEXT_KEYWORDS.forEach(k => {
      if (k.rx.test(sig.text!)) k.tags.forEach(t => (weights[t] = (weights[t] || 0) + 1));
    });
  }
  return weights;
}

// Score: (moodTagWeight * 2) + (prefs.typeScore * 1)
function scoreCard(card: Card, moodWeights: Record<string, number>, prefs: Prefs): number {
  let s = 0;
  const tags = card.tags || [];
  tags.forEach(t => { s += (moodWeights[t] || 0) * 2; });
  s += (prefs.typeScore[card.type] || 0) * 1;
  return s;
}

// Rank cards for a given signal
export function rankCards(cards: Card[], sig: MoodSignal | null): Card[] {
  const prefs = loadPrefs();
  const moodWeights = sig ? tagsFromMood(sig) : {};
  return [...cards].sort((a, b) => scoreCard(b, moodWeights, prefs) - scoreCard(a, moodWeights, prefs));
}
