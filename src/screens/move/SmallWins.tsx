import { useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/utils/analytics";
import { ArrowLeft } from "lucide-react";

// 👇 Emojis for extra personality (purely visual)
const ACTION_EMOJI: Record<string, string> = {
  walk: "🚶",
  stretch: "🤸",
  friend: "📞",
  air: "🌤️",
  song: "🎵",
  gratitude: "📝",
  hug: "🤗",
  tidy: "🧹",
  sing: "🎤",
  drink: "☕",
  plants: "🪴",
  organize: "🗂️",
  quote: "💬",
  mirror: "🪞",
  breathe: "🫁",
  water: "💧",
  window: "🪟",
  thankyou: "💌",
  listen: "👂",
  light: "🕯️",
  shoulder: "🧑‍🦽‍➡️", // shoulder roll-ish
};

const SCREENS = [
  [
    { id: "walk",      label: "Take a short walk" },
    { id: "stretch",   label: "Stretch 2 minutes" },
    { id: "friend",    label: "Text/call a friend" },
    { id: "air",       label: "Step out for air" },
    { id: "song",      label: "Play a favorite song" },
    { id: "gratitude", label: "Write one gratitude" },
    { id: "hug",       label: "Pet or hug someone" }
  ],
  [
    { id: "tidy",    label: "Tidy a small spot" },
    { id: "sing",    label: "Sing something" },
    { id: "drink",   label: "Make a warm drink" },
    { id: "plants",  label: "Water your plants" },
    { id: "organize",label: "Organize one thing" },
    { id: "quote",   label: "Read a positive quote" },
    { id: "mirror",  label: "Smile in the mirror" }
  ],
  [
    { id: "breathe", label: "3 deep breaths" },
    { id: "water",   label: "Drink water" },
    { id: "window",  label: "Look out the window" },
    { id: "thankyou",label: "Write a thank-you" },
    { id: "listen",  label: "Sit and just listen" },
    { id: "light",   label: "Soften the lights" },
    { id: "shoulder",label: "Light shoulder roll" }
  ]
];

const ACTION_DETAILS: Record<string, string> = {
  walk:      "Step outside and take a few easy steps. Notice the air and rhythm of your steps.",
  stretch:   "Roll your shoulders, find where it aches, and breathe into those spots.",
  friend:    "Reach out to someone you care about. A short message is enough.",
  air:       "Step outside, open your lungs, and refresh your mind.",
  song:      "Play a favorite song and let it shift your energy.",
  gratitude: "Think of one good thing today. Let yourself feel thankful.",
  hug:       "If you can, connect with someone or something that makes you smile.",
  tidy:      "Clear a corner or surface. Even a tiny reset helps your mind.",
  sing:      "Hum or sing freely. Don’t overthink, just feel the sound.",
  drink:     "Make a warm drink. Pause and enjoy each sip.",
  plants:    "Water your plants and notice their calm beauty.",
  organize:  "Tackle one small thing. Every bit of order adds peace.",
  quote:     "Here’s one: ‘No rain, no flowers.’ Let that stay with you.",
  mirror:    "Smile at yourself. You’re doing better than you think.",
  breathe:   "Inhale, exhale, repeat three times. Feel your body settle.",
  water:     "Have a drink of water. Simple refresh, instant shift.",
  window:    "Look out and just observe the world for a moment.",
  thankyou:  "Think of someone you appreciate. Write a short thank-you.",
  listen:    "Pause and listen. Let quiet sounds ground you.",
  light:     "Adjust the light, soften your space, breathe easy.",
  shoulder:  "Lift your shoulders, roll slowly, release tension."
};

export default function SmallWins() {
  const [screenIndex, setScreenIndex] = useState(0);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleSelect(actionId: string) {
    setSelectedAction(actionId);
    track("move_choice", { action: actionId });
  }

  function handleAccomplished() {
    setDone(true);
    track("move_done", { action: selectedAction });
  }

  // 🎉 Celebration screen
  if (done) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-background text-center p-6">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-3xl font-semibold mb-2">Nice work!</h2>
        <p className="text-muted-foreground mb-6">That was a small win worth celebrating.</p>
        <Button onClick={() => { setScreenIndex(0); setSelectedAction(null); setDone(false); }}>
          Back to Home
        </Button>
      </div>
    );
  }

  // 👉 Detail screen (after a bubble is selected)
  if (selectedAction) {
    const detail = ACTION_DETAILS[selectedAction];
    const label =
      SCREENS.flat().find(a => a.id === selectedAction)?.label ?? "Action";

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-pink-50 p-6 pb-24 transition-all duration-700 ease-in-out">
        {/* Good back button (returns to list) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedAction(null)}
          className="absolute left-4 top-4 h-10 w-10 rounded-full p-0"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </Button>

        <div className="max-w-md mx-auto pt-16 text-center relative">
          <div className="mx-auto mb-5 h-20 w-20 rounded-full bg-white shadow-card grid place-items-center">
            <span className="text-3xl">
              {ACTION_EMOJI[selectedAction] ?? "✨"}
            </span>
          </div>
          <h1 className="text-2xl font-semibold mb-3">{label}</h1>
          <p className="text-muted-foreground mb-8">{detail}</p>
          <Button onClick={handleAccomplished} className="rounded-full px-6">
            Accomplished ✓
          </Button>
        </div>
      </div>
    );
  }

  // 🫧 Select screen (playful circular “bubbles”)
  const actions = SCREENS[screenIndex];
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-purple-50 p-6">
      {/* Consistent back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.history.back()}
        className="absolute left-4 top-4 h-10 w-10 rounded-full p-0"
        aria-label="Back"
      >
        <ArrowLeft size={20} />
      </Button>

      <div className="max-w-md mx-auto pt-16">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary tracking-tight">Small Wins</h1>
          <p className="text-sm text-muted-foreground">Tiny actions that make a big lift.</p>
        </div>

        {/* Bubble grid */}
        <div className="grid grid-cols-3 gap-4">
          {actions.map((action, i) => (
            <button
              key={action.id}
              onClick={() => handleSelect(action.id)}
              className="
                relative isolate
                h-28 w-28 mx-auto
                rounded-full bg-white/80 backdrop-blur
                shadow-md hover:shadow-lg
                border border-white/60
                transition-all duration-200 active:scale-95
                grid place-items-center text-center px-3
              "
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* soft glow ring */}
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary/15 to-fuchsia-400/10 blur-[6px] -z-10" />
              {/* emoji */}
              <div className="text-2xl mb-1">
                {ACTION_EMOJI[action.id] ?? "✨"}
              </div>
              {/* label */}
              <div className="text-xs leading-tight font-medium text-foreground">
                {action.label}
              </div>
            </button>
          ))}
        </div>

        {/* Footer controls */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            className="px-4 py-2 rounded-full border bg-white/80 text-sm hover:bg-white transition"
            onClick={() => setScreenIndex((screenIndex + 1) % SCREENS.length)}
          >
            Shuffle suggestions →
          </button>
        </div>
      </div>
    </div>
  );
}
