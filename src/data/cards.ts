import { type Card } from "@/types/card";
import meditationCard from '@/assets/meditation-card.png';
import breathingCard from '@/assets/breathing-card.png';
import journalCard from '@/assets/journal-card.png'; // 👈 the “old” gratitude image

export const SEED_CARDS: Card[] = [
  {
    id: "card_mindful5",
    type: "meditation",
    title: "5-Minute Mindfulness",
    subtitle: "Center yourself and breathe",
    content: "Take a moment to center yourself with this gentle meditation. Focus on your breath and let your thoughts flow freely.",
    imageUrl: meditationCard,
    image: meditationCard,
    durationSec: 300,
    duration: "5 min",
    action: { kind: "open_meditation", meditationId: "mindful5" }
  },
  {
    id: "card_calm2",
    type: "meditation",
    title: "2-Minute Calm",
    subtitle: "Quick reset for busy moments",
    content: "A short but powerful meditation to reset your mind and find instant calm wherever you are.",
    imageUrl: meditationCard,
    image: meditationCard,
    durationSec: 120,
    duration: "2 min",
    action: { kind: "open_meditation", meditationId: "calm2" }
  },
  {
    id: "card_breathing",
    type: "breathing",
    title: "Box Breathing",
    content: "Try this simple breathing technique: Inhale for 4, hold for 4, exhale for 4, hold for 4. Repeat to find your calm.",
    imageUrl: breathingCard,
    image: breathingCard,
    durationSec: 180,
    duration: "3 min",
    action: { kind: "open_breath", patternId: "box44" } // 👈 optional: wire to breathing player if you added it
  },

  // ✅ NEW Gratitude card using the old image
  {
    id: "card_gratitude",
    type: "gratitude",
    title: "Gratitude Reflection",
    content: "What are three things you're grateful for today? Jot them down and why they mattered.",
    imageUrl: journalCard, // 👈 reuse old image
    image: journalCard,    // 👈 keep compatibility
    durationSec: 180,
    duration: "3 min",
    action: { kind: "open_gratitude" } // 👈 opens your Gratitude screen
  },

  // (Optional) If you still want to keep the old “perspective” card, you can, or remove it:
  // {
  //   id: "card_journal",
  //   type: "perspective",
  //   title: "Gratitude Reflection",
  //   content: "What are three things you're grateful for today? Write them down and reflect on why they matter to you.",
  //   imageUrl: journalCard,
  //   image: journalCard,
  //   durationSec: 120,
  //   duration: "2 min",
  //   action: { kind: "none" }
  // },

  {
    id: "card_companion",
    type: "companion",
    title: "AI Companion Chat",
    content: "I'm here to listen and support you. What's on your mind today? Share your thoughts and feelings in a safe space.",
    duration: "Open",
    action: { kind: "open_companion" }
  }
];
