import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { track } from "@/utils/analytics";
import { ArrowLeft, ChevronRight } from "lucide-react";

/**
 * GROUPS / CHECKLIST
 * You can tweak labels freely; ids must be unique across groups.
 */
const GROUPS: { title: string; items: { id: string; emoji: string; label: string }[] }[] = [
  {
    title: "Quick lift",
    items: [
      { id: "walk",      emoji: "🚶‍♀️", label: "Take a short walk" },
      { id: "stretch",   emoji: "🧘",   label: "Stretch for 2 minutes" },
      { id: "friend",    emoji: "📱",   label: "Call or text a friend" },
      { id: "air",       emoji: "🌤️",  label: "Step out for fresh air" },
      { id: "song",      emoji: "🎵",   label: "Play a favorite song" },
      { id: "gratitude", emoji: "📝",   label: "Write one gratitude" },
      { id: "hug",       emoji: "🤗",   label: "Pet an animal or hug" }
    ]
  },
  {
    title: "Reset your space",
    items: [
      { id: "tidy",    emoji: "🧹", label: "Tidy one small spot" },
      { id: "sing",    emoji: "🎤", label: "Sing a cheerful tune" },
      { id: "drink",   emoji: "☕", label: "Make a warm drink" },
      { id: "plants",  emoji: "🪴", label: "Water your plants" },
      { id: "organize",emoji: "🗂️", label: "Organize one small thing" },
      { id: "quote",   emoji: "💬", label: "Read a positive quote" },
      { id: "mirror",  emoji: "🪞", label: "Smile in the mirror" }
    ]
  },
  {
    title: "Micro-calm",
    items: [
      { id: "breathe", emoji: "🌬️", label: "Take three deep breaths" },
      { id: "water",   emoji: "💧",  label: "Drink a glass of water" },
      { id: "window",  emoji: "🪟",  label: "Look out the window" },
      { id: "thankyou",emoji: "✍️",  label: "Write a thank-you note" },
      { id: "listen",  emoji: "👂",  label: "Sit quietly and listen" },
      { id: "light",   emoji: "🕯️", label: "Soften the lights" },
      { id: "shoulder",emoji: "↩️",  label: "Do shoulder rolls" }
    ]
  }
];

/**
 * DETAIL INSTRUCTIONS
 * Short, encouraging guidance for each action.
 * “quote” uses a randomizer below.
 */
const ACTION_DETAILS: Record<string, string> = {
  walk:      "Head outside if you can. Notice your steps and breathing as you move.",
  stretch:   "Roll shoulders, scan for tight spots, and breathe into them slowly.",
  friend:    "Open your messages. Send a quick hello or ‘thinking of you’.",
  air:       "Step out or stand by a window. Take three slow breaths.",
  song:      "Play an upbeat favorite. Let your body sway if it feels good.",
  gratitude: "Think of one good thing today. Write a line about why it mattered.",
  hug:       "Share a moment with a pet or loved one. A few seconds is enough.",
  tidy:      "Pick a tiny zone (desk corner). Clear, wipe, and place one thing back mindfully.",
  sing:      "Hum or sing one verse. Volume low is fine—just feel the sound.",
  drink:     "Make a warm drink. Pause between sips—notice the smell and warmth.",
  plants:    "Water plants lightly. Notice leaves, new growth, and color.",
  organize:  "Sort a small stack. One category, two minutes. Done is great.",
  // quote handled via randomizer
  mirror:    "Offer yourself a small smile. Greet yourself like a friend.",
  breathe:   "Inhale for 4, hold 4, exhale 4. Repeat slowly three times.",
  water:     "Take a slow, refreshing sip. Feel your jaw unclench.",
  window:    "Look out for 30 seconds. Let your gaze settle on one calm spot.",
  thankyou:  "Draft a simple thank-you. One line is perfect.",
  listen:    "Close your eyes for 20 seconds. Name three soft sounds.",
  light:     "Dim a light or light a candle. Notice the mood shift.",
  shoulder:  "Lift, roll back, and release. Repeat gently three times."
};

const QUOTES = [
  "No rain, no flowers.",
  "One step at a time.",
  "Breathe. You’re here now.",
  "Where attention goes, energy flows.",
  "This too shall pass."
];
const randomQuote = () => QUOTES[Math.floor(Math.random() * QUOTES.length)];

/**
 * Which ids should open a dedicated “detail” view?
 * (Gratitude routes to /gratitude/new instead of inline.)
 */
const OPENS_DETAIL = new Set<string>([
  "walk","stretch","friend","air","song","gratitude","tidy","sing","drink",
  "plants","organize","quote","mirror","breathe","window","thankyou","listen","light","shoulder"
]);

export default function SmallWins() {
  const nav = useNavigate();

  // Completed selections (strike-through in checklist)
  const [selected, setSelected] = useState<string[]>([]);

  // Which group is visible (you can keep one checklist screen; keeping all three shown by default)
  // If you prefer page-by-page cycling, add UI to change an index; here we show all groups stacked.
  const groups = useMemo(() => GROUPS, []);

  // Current detail (when opened via chevron). null means we are in checklist view.
  const [detailId, setDetailId] = useState<string | null>(null);

  /** Toggle strike-through selection */
  function toggle(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    track("smallwins_toggle", { id });
  }

  /** Open detail or route to other flows */
  function openNow(id: string) {
    // Route to Gratitude flow
    if (id === "gratitude") {
      track("smallwins_open_route", { id });
      nav("/gratitude/new");
      return;
    }

    if (OPENS_DETAIL.has(id)) {
      setDetailId(id);
      track("smallwins_open_detail", { id });
      return;
    }

    // Fallback: if not mapped, just mark done
    toggle(id);
  }

  /** When user taps Accomplished on detail */
  function markAccomplished(id: string) {
    setSelected(prev => (prev.includes(id) ? prev : [...prev, id]));
    setDetailId(null);
    track("smallwins_done", { id });
  }

  /** Back buttons */
  function backFromDetail() {
    setDetailId(null);
  }
  function backToHome() {
    nav("/cards"); // your “home” / swipe deck
  }

  /** Derived helpers */
  const allItems = useMemo(
    () => groups.flatMap(g => g.items),
    [groups]
  );
  const currentDetail = detailId ? allItems.find(i => i.id === detailId) || null : null;

  // ---------- DETAIL SCREEN ----------
  if (currentDetail) {
    const isQuote = currentDetail.id === "quote";
    const detailText = isQuote
      ? randomQuote()
      : ACTION_DETAILS[currentDetail.id] || "Take a tiny step—then breathe.";

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-pink-50 p-6 pb-24">
        {/* Top bar with Back */}
        <div className="mx-auto max-w-md pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={backFromDetail}
            className="absolute left-4 top-4 h-10 w-10 rounded-full p-0"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </Button>
        </div>

        <div className="mx-auto max-w-md pt-16 text-center">
          <div className="text-5xl mb-3">{currentDetail.emoji}</div>
          <h1 className="text-2xl font-semibold mb-3">{currentDetail.label}</h1>
          <p className="text-muted-foreground mb-8">{detailText}</p>

          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={backFromDetail}
              className="rounded-full px-6"
            >
              Back
            </Button>
            <Button
              onClick={() => markAccomplished(currentDetail.id)}
              className="rounded-full px-6"
            >
              Accomplished ✓
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- CHECKLIST SCREEN ----------
  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      {/* Top bar back to Home (Swipe deck) */}
      <div className="mx-auto max-w-md pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={backToHome}
          className="absolute left-4 top-4 h-10 w-10 rounded-full p-0"
          aria-label="Back to Home"
        >
          <ArrowLeft size={20} />
        </Button>
      </div>

      <div className="mx-auto max-w-md pt-16">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2 tracking-tight">
            Small Wins
          </h1>
          <p className="text-base text-muted-foreground italic">
            Tiny actions that make a big lift.
          </p>
        </div>

        {/* Stacked groups */}
        <div className="space-y-8">
          {groups.map((group, gi) => (
            <section key={gi} className="rounded-xl border bg-card p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                {group.title}
              </h2>

              <ul className="divide-y divide-border/60">
                {group.items.map(item => {
                  const active = selected.includes(item.id);
                  return (
                    <li key={item.id} className="py-2">
                      <div className="flex items-center gap-3">
                        {/* Left area toggles strike-through */}
                        <button
                          onClick={() => toggle(item.id)}
                          className="flex items-center gap-3 text-left flex-1"
                          aria-label={active ? "Unselect" : "Select"}
                        >
                          {/* Checkbox badge */}
                          <span
                            className={
                              "grid h-6 w-6 place-items-center rounded-full border " +
                              (active
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-white border-border")
                            }
                          >
                            {active ? "✓" : ""}
                          </span>

                          {/* Emoji centered */}
                          <span className="text-xl leading-none flex items-center justify-center h-6 w-6">
                            {item.emoji}
                          </span>

                          {/* Label (strike when selected) */}
                          <span
                            className={
                              "flex-1 text-sm " +
                              (active ? "line-through text-muted-foreground" : "text-foreground")
                            }
                          >
                            {item.label}
                          </span>
                        </button>

                        {/* “Open now” chevron */}
                        <button
                          onClick={() => openNow(item.id)}
                          className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition"
                          aria-label="Open now"
                          title="Open now"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
