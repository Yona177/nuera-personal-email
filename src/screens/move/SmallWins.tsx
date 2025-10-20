import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/utils/analytics";
import { ArrowLeft } from "lucide-react";

/** Single flat list (no paging, no shuffle) */
const ITEMS = [
  // Quick lifts
  { id: "walk",      emoji: "🚶", label: "Take a short walk",                 opensScreen: true  },
  { id: "stretch",   emoji: "🧘", label: "Stretch for 2 minutes",              opensScreen: true  },
  { id: "friend",    emoji: "💬", label: "Call or text a friend",              opensScreen: true  },
  { id: "air",       emoji: "🌤️",label: "Step outside for fresh air",        opensScreen: true  },
  { id: "song",      emoji: "🎵", label: "Play your favorite song",            opensScreen: true  },
  { id: "gratitude", emoji: "✍️", label: "Write one thing you’re grateful for",opensScreen: true  },
  { id: "hug",       emoji: "🤗", label: "Pet an animal or hug someone",       opensScreen: true  },

  // Reset & tidy
  { id: "tidy",     emoji: "🧽", label: "Tidy up your space",                  opensScreen: true  },
  { id: "sing",     emoji: "🎙️",label: "Sing a cheerful song",                opensScreen: false },
  { id: "drink",    emoji: "☕", label: "Make a warm drink",                   opensScreen: true  },
  { id: "plants",   emoji: "🪴", label: "Water your plants",                   opensScreen: true  },
  { id: "organize", emoji: "🗂️",label: "Organize one small thing",            opensScreen: true  },
  { id: "quote",    emoji: "💡", label: "Read a positive quote",               opensScreen: true  },
  { id: "mirror",   emoji: "🙂", label: "Smile in the mirror",                 opensScreen: false },

  // Slow & ground
  { id: "breathe",  emoji: "🌬️",label: "Take three deep breaths",             opensScreen: true  },
  { id: "water",    emoji: "💧", label: "Drink a glass of water",              opensScreen: false },
  { id: "window",   emoji: "🪟", label: "Look out the window",                 opensScreen: true  },
  { id: "thankyou", emoji: "💌", label: "Write a thank-you note",              opensScreen: true  },
  { id: "listen",   emoji: "👂", label: "Sit quietly and listen",              opensScreen: true  },
  { id: "light",    emoji: "🕯️",label: "Light a candle or dim lights",        opensScreen: false },
  { id: "shoulder", emoji: "🤸", label: "Do a light shoulder roll",            opensScreen: true  },
] as const;

const DETAILS: Record<string, string> = {
  walk:      "Walk a minute or two. Notice breath and steps.",
  stretch:   "Roll shoulders, gentle neck turns; breathe into tight spots.",
  friend:    "Send a quick hello or check-in. Short & sincere is perfect.",
  air:       "Open a door/window. Take a few slow, full breaths.",
  song:      "Play one uplifting track. Let your body sway a little.",
  gratitude: "Write one good thing from today and why it mattered.",
  hug:       "If you can, hug a loved one or pet for a few seconds.",
  tidy:      "Clear one small surface. Enjoy the quick before/after.",
  drink:     "Make a warm tea/coffee. Savor a few slow sips.",
  plants:    "Water your plants; notice new leaves or growth.",
  organize:  "Pick one tiny task (drawer, email) and complete it.",
  quote:     "“No rain, no flowers.” Sit with it for a few breaths.",
  breathe:   "Inhale 4, hold 2, exhale 6. Repeat three times.",
  window:    "Look out and notice three things you can see.",
  thankyou:  "Write a short thank-you to someone specific.",
  listen:    "Close eyes. Notice far, mid, and near sounds.",
  light:     "Soften the lighting; let the space feel calm.",
  shoulder:  "Lift, roll back and down twice. Relax your jaw.",
};

export default function SmallWins() {
  // simple in-memory completed set
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const all = useMemo(() => ITEMS, []);

  const toggleSimple = (id: string) => {
    setCompleted((prev) => {
      const next = !prev[id];
      track("smallwins_toggle", { id, done: next });
      return { ...prev, [id]: next };
    });
  };

  const handlePick = (id: string, opens: boolean) => {
    track("smallwins_select", { id });
    if (opens) setSelectedId(id);
    else toggleSimple(id);
  };

  /** DETAIL SCREEN */
  if (selectedId) {
    const item = all.find((i) => i.id === selectedId)!;
    const text = DETAILS[selectedId] ?? "Give this a gentle try.";

    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-md p-6 pt-16 relative">
          {/* Back button (same style everywhere) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedId(null)}
            className="group absolute left-4 top-4 h-10 w-10 rounded-full p-0"
            aria-label="Back"
          >
            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-0.5" />
          </Button>

          <div className="mb-6">
            <div className="text-4xl mb-2">{item.emoji}</div>
            <h1 className="text-2xl font-semibold">{item.label}</h1>
          </div>

          <p className="text-muted-foreground mb-8">{text}</p>

          <div className="flex gap-3">
            <Button
              className="rounded-full px-6"
              onClick={() => {
                setCompleted((p) => ({ ...p, [selectedId]: true }));
                track("smallwins_completed", { id: selectedId });
                setSelectedId(null);
              }}
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

  /** CHECKLIST SCREEN (one page, compact, no boxes) */
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md p-6 pt-16 relative">
        {/* Back button with hover nudge */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="group absolute left-4 top-4 h-10 w-10 rounded-full p-0"
          aria-label="Back"
        >
          <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-0.5" />
        </Button>

        <h1 className="text-3xl font-bold text-primary mb-2 tracking-tight">Small Wins</h1>
        <p className="text-base text-muted-foreground italic mb-6">
          Tiny actions that make a big lift.
        </p>

        <ul className="space-y-1">
          {all.map((item) => {
            const done = !!completed[item.id];
            return (
              <li key={item.id}>
                <button
                  onClick={() => handlePick(item.id, item.opensScreen)}
                  className={[
                    "w-full flex items-center gap-3 rounded-lg px-2 py-2",
                    "border border-transparent hover:border-border hover:bg-card/60",
                    "text-left transition-colors",
                    done ? "opacity-70" : ""
                  ].join(" ")}
                >
                  {/* emoji inline (no circle) */}
                  <span className="text-xl leading-none">{item.emoji}</span>

                  {/* label with strike when done */}
                  <span className={`flex-1 text-sm ${done ? "line-through" : ""}`}>
                    {item.label}
                  </span>

                  {/* light checkmark UI feedback */}
                  <span
                    className={[
                      "h-4 w-4 rounded-sm border",
                      done ? "bg-primary border-primary" : "border-muted-foreground/30"
                    ].join(" ")}
                    aria-hidden
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
