import { type Card } from "@/types/card";
import meditationCard from "@/assets/meditation-card.png";
import breathingCard from "@/assets/breathing-card.png";
import journalCard from "@/assets/journal-card.png";
import companionCard from '@/assets/companion-card.svg';

/**
 * Tags cheat-sheet used by the recommender:
 *  - "mindfulness"  → general calm, present-focus meditations
 *  - "calm"         → soothing/relaxing content
 *  - "breath"       → breathing techniques (box breathing, etc.)
 *  - "gratitude"    → gratitude journaling/reflection
 *  - "focus"        → attention / deep work support
 *  - "sleep"        → wind-down / sleep hygiene
 *  - "companion"    → AI companion / talk support
 *  - "energize"     → uplifting content
 */

export const SEED_CARDS: Card[] = [
  {
    id: "card_mindful5",
    type: "meditation",
    title: "5-Minute Mindfulness",
    subtitle: "Center yourself and breathe",
    content:
      "Take a moment to center yourself with this gentle meditation. Focus on your breath and let your thoughts flow freely.",
    imageUrl: meditationCard,
    image: meditationCard, // compatibility
    durationSec: 300,
    duration: "5 min", // compatibility
    tags: ["mindfulness", "calm"],
    action: { kind: "open_meditation", meditationId: "mindful5" }
  },

  {
    id: "card_calm2",
    type: "meditation",
    title: "2-Minute Calm",
    subtitle: "Quick reset for busy moments",
    content:
      "A short but powerful meditation to reset your mind and find instant calm wherever you are.",
    imageUrl: meditationCard,
    image: meditationCard,
    durationSec: 120,
    duration: "2 min",
    tags: ["calm", "mindfulness"],
    action: { kind: "open_meditation", meditationId: "calm2" }
  },

  {
    id: "card_breathing",
    type: "breathing",
    title: "Box Breathing",
    content:
      "Try this simple technique: Inhale 4, hold 4, exhale 4, hold 4. Repeat to find your calm.",
    imageUrl: breathingCard,
    image: breathingCard,
    durationSec: 180,
    duration: "3 min",
    tags: ["breath", "calm", "focus"],
    action: { kind: "open_breath", patternId: "box44" }
  },

  {
    id: "card_gratitude",
    type: "perspective",
    title: "Gratitude Reflection",
    content:
      "What are three things you're grateful for today? Write them down and reflect on why they matter to you.",
    imageUrl: journalCard,   // uses your existing image asset
    image: journalCard,
    durationSec: 180,
    duration: "3 min",
    tags: ["gratitude", "mindfulness"],
    action: { kind: "none" } // handled via /gratitude/new route from the deck logic later if desired
  },

{
  id: "card_companion",
  type: "companion",
  title: "AI Companion Chat",
  subtitle: "Here to listen, anytime",
  content: "I'm here to listen and support you. What's on your mind today? Share your thoughts and feelings in a safe space.",
  imageUrl: companionCard,
  image: companionCard, // keep compatibility with existing rendering
  duration: "Open",
  tags: ["companion","support","chat","mindfulness"],
  action: { kind: "open_companion" }
}
];
