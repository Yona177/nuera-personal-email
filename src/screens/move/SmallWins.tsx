import { useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/utils/analytics";
import { ArrowLeft } from "lucide-react";

/**
 * Groups with emojis. ids must be unique across all groups.
 * opensScreen=true => shows a short guidance screen, then returns & marks done.
 */
const GROUPS = [
  {
    title: "Quick lifts",
    items: [
      { id: "walk",      emoji: "🚶", label: "Take a short walk",                 opensScreen: true },
      { id: "stretch",   emoji: "🧘", label: "Stretch for 2 minutes",              opensScreen: true },
      { id: "friend",    emoji: "💬", label: "Call or text a friend",              opensScreen: true },
      { id: "air",       emoji: "🌤️", label: "Step outside for fresh air",        opensScreen: true },
      { id: "song",      emoji: "🎵", label: "Play your favorite song",            opensScreen: true },
      { id: "gratitude", emoji: "✍️", label: "Write one thing you’re grateful for",opensScreen: true },
      { id: "hug",       emoji: "🤗", label: "Pet an animal or hug someone",       opensScreen: true }
    ]
  },
  {
    title: "Reset & tidy",
    items: [
      { id: "tidy",     emoji: "🧽", label: "Tidy up your space",                  opensScreen: true  },
      { id: "sing",     emoji: "🎙️",label: "Sing a cheerful song",                opensScreen: false },
      { id: "drink",    emoji: "☕", label: "Make a warm drink",                   opensScreen: true  },
      { id: "plants",   emoji: "🪴", label: "Water your plants",                   opensScreen: true  },
      { id: "organize", emoji: "🗂️",label: "Organize one small thing",            opensScreen: true  },
      { id: "quote",    emoji: "💡", label: "Read a positive quote",               opensScreen: true  },
      { id: "mirror",   emoji: "🙂", label: "Smile in the mirror",                 opensScreen: false }
    ]
  },
  {
    title: "Slow & ground",
    items: [
      { id: "breathe",  emoji: "🌬️",label: "Take three deep breaths",             opensScreen: true  },
      { id: "water",    emoji: "💧", label: "Drink a glass of water",              opensScreen: false },
      { id: "window",   emoji: "🪟", label: "Look out the window",                 opensScreen: true  },
      { id: "thankyou", emoji: "💌", label: "Write a thank-you note",              opensScreen: true  },
      { id: "listen",   emoji: "👂", label: "Sit quietly and listen",              opensScreen: true  },
      { id: "light",    emoji: "🕯️",label: "Light a candle or dim lights",        opensScreen: false },
      { id: "shoulder", emoji: "🤸", label: "Do a light shoulder roll",            opensScreen: true  }
    ]
  }
] as const;

/** Guidance copy for detail screen */
const DETAILS: Record<string, string> = {
  walk:      "Walk a minute or two. Notice breath and steps.",
  stretch:   "Roll shoulders, gentle neck turns; breathe into tight spots.",
  friend:    "Send a simple hello or check-in. Short & sincere is perfect.",
  air:       "Open a door/window. Take a few slow, full breaths.",
  song:      "Play one uplifting track. Let your body sway a little.",
  gratitude: "Write one good thing from today and why it mattered.",
  hug:       "If possible, hug a loved one or pet for a few seconds.",
  tidy:      "Clear one small surface. Enjoy the quick before/after.",
  drink:     "Make a warm tea/coffee. Savor slow sips.",
  plants:    "Water your plants; notice new leaves or growth.",
  organize:  "Pick one tiny task (drawer, email) and complete it.",
  quote:     "“No rain, no flowers.” Sit with it for a few breaths.",
  breathe:   "Inhale 4, hold 2, exhale 6. Repeat three times.",
  window:    "Look out and notice three things you can see.",
  thankyou:  "Write a short thank-you to someone specific.",
  listen:    "Close your eyes. Notice far, mid, and near sounds.",
  light:     "Soften lighting; let the space feel calm.",
  shoulder:  "Lift, roll back and down twice. Relax your jaw."
};

export default function SmallWins() {
  const [groupIndex, setGroupIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const currentGroup = GROUPS[groupIndex];

  const markCompleted = (id: string) => {
    setCompleted(prev => ({ ...prev, [id]: true }));
    track("smallwins_completed", { id });
  };

  const handlePick = (id: string, opensScreen: boolean) => {
    track("smallwins_select", { id });
    if (opensScreen) setSelectedId(id);
    else markCompleted(id);
  };

  // Detail screen
  if (selectedId) {
    const item =
      GROUPS.flatMap(g => g.items).find(i => i.id === selectedId) || {
        emoji: "✨",
        label: "Action"
      };
    const text = DETAILS[selectedId] || "Give this a gentle try.";

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-pink-50">
        <div className="mx-auto max-w-md p-6 pt-16 relative">
          {/* Back button (consistent) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedId(null)}
            className="absolute left-4 top-4 h-10 w-10 rounded-full p-0"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </Button>

          {/* Emoji badge + title */}
          <div className="mb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border bg-white/80 flex items-center justify-center text-xl">
              {item.emoji}
            </div>
            <h1 className="text-2xl font-semibold">{item.label}</h1>
          </div>

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

  // Checklist screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-pink-50">
      <div className="mx-auto max-w-md p-6 pt-16 relative">
        {/* Back button (same style) */}
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

        <div className="mb-4 text-sm font-medium text-muted-foreground">
          {currentGroup.title}
        </div>

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
                {/* Emoji badge */}
                <div className="h-9 w-9 rounded-full border bg-white flex items-center justify-center text-lg">
                  {item.emoji}
                </div>

                {/* Checkbox + label */}
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={isDone}
                  onChange={() => {
                    if (isDone) {
                      setCompleted(prev => ({ ...prev, [item.id]: false }));
                    } else {
                      handlePick(item.id, item.opensScreen);
                    }
                  }}
                />
                <span className={`text-sm ${isDone ? "line-through" : ""}`}>
                  {item.label}
                </span>

                {/* Open button for secondary screen */}
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
