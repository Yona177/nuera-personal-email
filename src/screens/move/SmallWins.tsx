import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/utils/analytics";
import { ArrowLeft } from "lucide-react";

/**
 * GROUPS / CHECKLIST
 * You can tweak labels freely; ids must be unique across groups.
 * Items with `opensScreen: true` show a short guidance screen,
 * then return and mark as completed.
 */
const GROUPS = [
  {
    title: "Quick lifts",
    items: [
      { id: "walk", label: "Take a short walk", opensScreen: true },
      { id: "stretch", label: "Stretch for 2 minutes", opensScreen: true },
      { id: "friend", label: "Call or text a friend", opensScreen: true },
      { id: "air", label: "Step outside for fresh air", opensScreen: true },
      { id: "song", label: "Play your favorite song", opensScreen: true },
      { id: "gratitude", label: "Write one thing you’re grateful for", opensScreen: true },
      { id: "hug", label: "Pet an animal or hug someone", opensScreen: true }
    ]
  },
  {
    title: "Reset & tidy",
    items: [
      { id: "tidy", label: "Tidy up your space", opensScreen: true },
      { id: "sing", label: "Sing a cheerful song", opensScreen: false },
      { id: "drink", label: "Make a warm drink", opensScreen: true },
      { id: "plants", label: "Water your plants", opensScreen: true },
      { id: "organize", label: "Organize one small thing", opensScreen: true },
      { id: "quote", label: "Read a positive quote", opensScreen: true },
      { id: "mirror", label: "Smile in the mirror", opensScreen: false }
    ]
  },
  {
    title: "Slow & ground",
    items: [
      { id: "breathe", label: "Take three deep breaths", opensScreen: true },
      { id: "water", label: "Drink a glass of water", opensScreen: false },
      { id: "window", label: "Look out the window", opensScreen: true },
      { id: "thankyou", label: "Write a thank-you note", opensScreen: true },
      { id: "listen", label: "Sit quietly and listen", opensScreen: true },
      { id: "light", label: "Light a candle or dim lights", opensScreen: false },
      { id: "shoulder", label: "Do a light shoulder roll", opensScreen: true }
    ]
  }
] as const;

/** Short guidance text for the detail screen */
const DETAILS: Record<string, string> = {
  walk:      "Step outside and walk a minute or two. Notice your breath and steps.",
  stretch:   "Roll shoulders, gentle neck turns. Breathe into any tight spots.",
  friend:    "Send a simple hello or check-in. Short and sincere is perfect.",
  air:       "Open a door or window; take a few slow, full breaths.",
  song:      "Play one uplifting track. Let your body sway a little.",
  gratitude: "Write one good thing from today and why it mattered.",
  hug:       "If possible, hug a loved one or pet. A few seconds is enough.",
  tidy:      "Clear one small surface. Enjoy the quick before/after.",
  drink:     "Make a warm tea or coffee. Savor slow sips.",
  plants:    "Water your plants and notice new leaves or growth.",
  organize:  "Pick one tiny task (drawer, email) and complete it.",
  quote:     "“No rain, no flowers.” Sit with it for a few breaths.",
  breathe:   "Inhale 4, hold 2, exhale 6. Repeat three times.",
  window:    "Look out and notice three things you can see.",
  thankyou:  "Write a short thank-you to someone specific.",
  listen:    "Close your eyes. Notice far, mid, and near sounds.",
  shoulder:  "Lift, roll back and down, twice. Relax your jaw."
};

export default function SmallWins() {
  const [groupIndex, setGroupIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const currentGroup = GROUPS[groupIndex];

  // For marking completed after we return from detail screen
  const markCompleted = (id: string) => {
    setCompleted(prev => ({ ...prev, [id]: true }));
    track("smallwins_completed", { id });
  };

  const handlePick = (id: string, opensScreen: boolean) => {
    track("smallwins_select", { id });
    if (opensScreen) {
      setSelectedId(id);
    } else {
      // Immediate completion (strikethrough)
      markCompleted(id);
    }
  };

  // DETAIL SCREEN
  if (selectedId) {
    const label =
      GROUPS.flatMap(g => g.items).find(i => i.id === selectedId)?.label || "Action";
    const text = DETAILS[selectedId] || "Give this a gentle try.";
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-pink-50">
        <div className="mx-auto max-w-md p-6 pt-16 relative">
          {/* Back button (same style both screens) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedId(null)}
            className="absolute left-4 top-4 h-10 w-10 rounded-full p-0"
          >
            <ArrowLeft size={20} />
          </Button>

          <h1 className="text-2xl font-semibold mb-3">{label}</h1>
          <p className="text-muted-foreground mb-8">{text}</p>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                markCompleted(selectedId);
                setSelectedId(null);
              }}
              className="rounded-full px-6"
            >
              Accomplished ✓
            </Button>
            <Button variant="ghost" onClick={() => setSelectedId(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // CHECKLIST SCREEN
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-pink-50">
      <div className="mx-auto max-w-md p-6 pt-16 relative">
        {/* Back button (same style as detail screen) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="absolute left-4 top-4 h-10 w-10 rounded-full p-0"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </Button>

        <h1 className="text-3xl font-bold text-primary mb-2 tracking-tight">Small Wins</h1>
        <p className="text-base text-muted-foreground italic mb-6">
          Tiny actions that make a big lift.
        </p>

        {/* Group title */}
        <div className="mb-4 text-sm font-medium text-muted-foreground">
          {currentGroup.title}
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          {currentGroup.items.map(item => {
            const isDone = !!completed[item.id];
            return (
              <label
                key={item.id}
                className={`flex items-center gap-3 rounded-xl border bg-white/70 backdrop-blur px-3 py-3 shadow-sm hover:bg-white hover:shadow-md transition-all ${
                  isDone ? "opacity-60" : ""
                }`}
              >
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={isDone}
                  onChange={() => {
                    if (isDone) {
                      setCompleted(prev => ({ ...prev, [item.id]: false }));
                    } else {
                      if (item.opensScreen) {
                        handlePick(item.id, true);
                      } else {
                        handlePick(item.id, false);
                      }
                    }
                  }}
                />
                <span className={`text-sm ${isDone ? "line-through" : ""}`}>
                  {item.label}
                </span>
                {!isDone && item.opensScreen && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-xs"
                    onClick={() => handlePick(item.id, true)}
                  >
                    Open
                  </Button>
                )}
              </label>
            );
          })}
        </div>

        {/* None of these → cycle groups */}
        <div className="mt-6">
          <Button
            variant="secondary"
            onClick={() => setGroupIndex((groupIndex + 1) % GROUPS.length)}
          >
            None of these →
          </Button>
        </div>
      </div>
    </div>
  );
}
