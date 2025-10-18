import { useNavigate } from "react-router-dom";
import type { Card } from "@/types/card";

export function useCardActions() {
  const nav = useNavigate();

  function onSwipeRight(card: Card) {
    // Positive action
    if (!card.action) return;

    switch (card.action.kind) {
      case "open_meditation":
        nav(`/meditation/${card.action.meditationId}`);
        break;
      case "open_breath":
        nav(`/breathing/${card.action.patternId}`);
        break;
      case "open_cbt":
        // e.g., nav(`/cbt/${card.action.tipId}`);
        break;
      case "open_companion":
        // e.g., nav(`/companion`);
        break;
      case "open_sleep":
        // e.g., nav(`/sleep/${card.action.routineId}`);
        break;
      case "open_gratitude":
        nav(`/gratitude/new`); // 👈 Gratitude screen
        break;
      case "none":
      default:
        // do nothing
        break;
    }
  }

  function onSwipeLeft(_card: Card) {
    // Negative action — right now do nothing (or track “dismiss”)
  }

  return { onSwipeRight, onSwipeLeft };
}
