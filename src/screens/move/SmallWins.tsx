import { useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/utils/analytics";
import { ArrowLeft } from "lucide-react";

const SCREENS = [
  [
    { id: "walk",      label: "Take a short walk" },
    { id: "stretch",   label: "Stretch for 2 minutes" },
    { id: "friend",    label: "Call or text a friend" },
    { id: "air",       label: "Step outside for fresh air" },
    { id: "song",      label: "Play your favorite song" },
    { id: "gratitude", label: "Write one thing you’re grateful for" },
    { id: "hug",       label: "Pet an animal or hug someone" }
  ],
  [
    { id: "tidy",    label: "Tidy up your space" },
    { id: "sing",    label: "Sing a cheerful song" },
    { id: "drink",   label: "Make a warm drink" },
    { id: "plants",  label: "Water your plants" },
    { id: "organize",label: "Organize one small thing" },
    { id: "quote",   label: "Read a positive quote" },
    { id: "mirror",  label: "Smile at yourself in the mirror" }
  ],
  [
    { id: "breathe", label: "Take three deep breaths" },
    { id: "water",   label: "Drink a glass of water" },
    { id: "window",  label: "Look out the window" },
    { id: "thankyou",label: "Write a thank-you note" },
    { id: "listen",  label: "Sit quietly and listen" },
    { id: "light",   label: "Light a candle or dim lights" },
    { id: "shoulder",label: "Do a light shoulder roll" }
  ]
];

const ACTION_DETAILS: Record<string, string> = {
  walk:      "Step outside and take a few easy steps. Notice the air and rhythm of your steps.",
  stretch:   "Roll your shoulders, find where it aches, and breathe into those spots.",
  friend:    "Reach out to someone you care about. A short message is enough.",
  air:       "Step outside, open your lungs, and refresh your mind.",
  song:      "Play your favorite song and let it shift your energy.",
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
    const label = SCREENS.flat().find(a => a.id === selectedAction)?.label ?? "Action";

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
          <h1 className="text-2xl font-semibold mb-4">{label}</h1>
          <p className="text-muted-foreground mb-8">{detail}</p>
          <Button onClick={handleAccomplished} className="rounded-full px-6">
            Accomplished ✓
          </Button>
        </div>
      </div>
    );
  }

  // 🫧 Select screen (bubbles)
  const actions = SCREENS[screenIndex];
  return (
    <div className="min-h-screen bg-background p-6">
      {/* Use the same good back button UI on the first screen too */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.history.back()}
        className="absolute left-4 top-4 h-10 w-10 rounded-full p-0"
        aria-label="Back"
      >
        <ArrowLeft size={20} />
      </Button>

      <div className="max-w-md mx-auto pt-16 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2 tracking-tight">Small Wins</h1>
        <p className="text-base text-muted-foreground italic">Tiny actions that make a big lift.</p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {actions.map(action => (
            <button
              key={action.id}
              onClick={() => handleSelect(action.id)}
              className="rounded-full border px-4 py-3 text-sm font-medium shadow-sm bg-white/70 backdrop-blur hover:bg-white hover:shadow-md transition-all duration-200"
            >
              {action.label}
            </button>
          ))}

          <button
            className="px-4 py-2 rounded-full border bg-muted text-sm text-muted-foreground hover:bg-accent"
            onClick={() => setScreenIndex((screenIndex + 1) % SCREENS.length)}
          >
            None of these →
          </button>
        </div>
      </div>
    </div>
  );
}
