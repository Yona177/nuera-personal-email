import { useNavigate } from "react-router-dom";
import type { Card } from "@/types/card";
import { track } from "@/utils/analytics";

export function useCardActions() {
  const nav = useNavigate();

  function onSwipeRight(card: Card) {
    if (!card.action) return;

    // Optional analytics tracking
    track("card_swipe_right", { id: card.id, kind: card.action.kind });

    switch (card.action.kind) {
      case "open_meditation":
        nav(`/meditation/${card.action.meditationId}`);
        break;

      case "open_breath":
        nav(`/breathing/${card.action.patternId}`);
        break;

      case "open_cbt":
        // Future CBT feature
        // nav(`/cbt/${card.action.tipId}`);
        break;

      case "open_companion":
        // ✅ Now navigates correctly to the AI Companion chat screen
        nav(`/companion`);
        break;

      case "open_sleep":
        // Future Sleep feature
        // nav(`/sleep/${card.action.routineId}`);
        break;

      case "open_gratitude":
        nav(`/gratitude/new`);
        break;

      case "none":
      default:
        // no navigation or side-effect
        break;
    }
  }

  function onSwipeLeft(card: Card) {
    // Optional analytics tracking for dismisses
    track("card_swipe_left", { id: card.id, kind: card.action?.kind });
  }

  return { onSwipeRight, onSwipeLeft };
}
