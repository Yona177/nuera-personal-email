import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/utils/analytics";
import { ArrowLeft } from "lucide-react";
import { appendSmallWin } from "@/store/smallwins";
import { useNavigate } from "react-router-dom";

// --- DATA -------------------------------------------------------------------
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
  walk:      "Head outside (or hallway) for a few easy steps. Notice your breathing and the rhythm of your feet.",
  stretch:   "Roll shoulders, gently scan for tight spots, and breathe into them. Slow, easy movements.",
  friend:    "Open your messages. Send a simple ‘thinking of you’ or a quick check-in to someone you care about.",
  air:       "Open a door or window, step out if you can, and take a slow, deep breath. Feel the air change.",
  song:      "Play a song that lifts you. Let your body sway a little. No need to think—just feel.",
  gratitude: "Think of one good thing from today. Name it, and let yourself feel thankful for a few seconds.",
  hug:       "Connect with a pet or person you trust. Offer a gentle pat or hug, and notice the warmth.",
  tidy:      "Pick one small spot (desk, shelf). Set a 2-minute timer, tidy just that, and stop when it ends.",
  sing:      "Hum or sing one upbeat verse or chorus. Focus on the sound and your breath.",
  drink:     "Make a warm tea or cocoa. Hold the mug, breathe the scent, and take slow mindful sips.",
  plants:    "Water plants at home. Notice their shapes and colors as you care for them.",
  organize:  "Choose one tiny admin task (bill, receipt, file). Do just that one thing.",
  quote:     "Read a short uplifting quote. Breathe with it for a moment and let it land.",
  mirror:    "Offer yourself a small smile. Acknowledge something you did right today—no matter how small.",
  breathe:   "Inhale 4, hold 4, exhale 4, hold 4. Repeat 3 times, slowly.",
  water:     "Have a glass of water. Feel the cool refresh and the reset it brings.",
  window:    "Look out and observe one detail—light, motion, color—for 10–20 seconds.",
  thankyou:  "Write a short thank-you to someone. One sentence is enough. Send or save for later.",
  listen:    "Sit for 20–30 seconds and just listen. Notice distant and near sounds.",
  light:     "Dim harsh lights or light a candle. Let your eyes soften and shoulders drop.",
  shoulder:  "Lift shoulders toward ears, then roll them back and down. Repeat slowly a few times."
};

// Which actions open a detail screen instead of inline checking?
const DETAIL_ACTIONS = new Set<string>([
  "walk","stretch","friend","air","song","gratitude","hug",
  "tidy","sing","drink","plants","organize","quote","mirror",
  "breathe","water","window","thankyou","listen","light","shoulder"
]);

// --- COMPONENT --------------------------------------------------------------
export default function SmallWins() {
  const nav = useNavigate();
  const [screenIndex, setScreenIndex] = useState(0);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [celebrateKey, setCelebrateKey] = useState<number>(0); // to retrigger confetti
  const confettiRef = useRef<HTMLDivElement | null>(null);

  // Fire open event once
  useEffect(() => { track("smallwins_open", {}); }, []);

  const actions = useMemo(() => SCREENS[screenIndex], [screenIndex]);

  function handleToggle(id: string) {
    const next = !checked[id];
    setChecked(prev => ({ ...prev, [id]: next }));
    track("smallwins_toggle", { action: id, checked: next });

    // Micro celebration on check
    if (next) {
      appendSmallWin(id, true);
      // trigger pop on that row (via class) + subtle confetti at top
      setCelebrateKey(k => k + 1);
      if (confettiRef.current) {
        confettiRef.current.classList.remove("sw-pop");
        // force reflow to restart animation
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        confettiRef.current.offsetHeight;
        confettiRef.current.classList.add("sw-pop");
      }
    }
  }

  function handleExpand(id: string) {
    setSelectedAction(id);
    track("smallwins_expand", { action: id });
  }

  function handleAccomplished() {
    if (!selectedAction) return;
    appendSmallWin(selectedAction, true);
    track("smallwins_detail_done", { action: selectedAction });
    // Mark as checked in checklist view and return
    setChecked(prev => ({ ...prev, [selectedAction]: true }));
    setSelectedAction(null);
    // pulse confetti layer
    setCelebrateKey(k => k + 1);
  }

  function backToHome() {
    nav(-1);
  }

  // --- Detail Screen ---
  if (selectedAction) {
    const label = SCREENS.flat().find(a => a.id === selectedAction)?.label ?? "Action";
    const detail = ACTION_DETAILS[selectedAction];

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-pink-50 p-6 pb-24 relative">
        {/* Back (same visual used in your other detail screens) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedAction(null)}
          className="absolute left-4 top-4 h-10 w-10 rounded-full p-0"
        >
          <ArrowLeft size={20} />
        </Button>

        {/* Subtle confetti layer (re-render with celebrateKey) */}
        <div key={celebrateKey} className="sw-confetti">
          <span/><span/><span/>
        </div>

        <div className="mx-auto max-w-md pt-16 text-center">
          <h1 className="text-2xl font-semibold mb-3">{label}</h1>
          <p className="text-muted-foreground mb-8">{detail}</p>

          <Button onClick={handleAccomplished} className="rounded-full px-6">
            Accomplished ✓
          </Button>

          <div className="mt-8">
            <Button variant="ghost" onClick={backToHome}>Back to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Checklist Screen ---
  const allChecked = actions.every(a => !!checked[a.id]);

  useEffect(() => {
    if (allChecked && actions.length > 0) {
      track("smallwins_complete", { screenIndex });
    }
  }, [allChecked, actions.length, screenIndex]);

  return (
    <div className="min-h-screen bg-background p-6 relative">
      {/* Header + Back */}
      <div className="absolute left-4 top-4">
        <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full p-0" onClick={backToHome}>
          <ArrowLeft size={20} />
        </Button>
      </div>

      {/* Subtle confetti burst container */}
      <div ref={confettiRef} className="sw-confetti">
        <span/><span/><span/>
      </div>

      <div className="mx-auto max-w-md pt-16">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-1 tracking-tight">Small Wins</h1>
          <p className="text-base text-muted-foreground italic">Tiny actions that make a big lift.</p>
        </div>

        <div className="rounded-2xl border bg-card p-2">
          <ul className="divide-y">
            {actions.map(({ id, label }) => {
              const isChecked = !!checked[id];
              return (
                <li key={id} className={`flex items-center justify-between gap-3 p-3 ${isChecked ? "sw-pop" : ""}`}>
                  <button
                    onClick={() => handleToggle(id)}
                    className={`h-6 w-6 rounded border flex items-center justify-center ${isChecked ? "bg-primary text-primary-foreground border-primary" : "bg-background"}`}
                    aria-label={isChecked ? "Uncheck" : "Check"}
                    title={isChecked ? "Uncheck" : "Check"}
                  >
                    {isChecked ? "✓" : ""}
                  </button>

                  <div className="flex-1 text-left">
                    <div className={`text-sm ${isChecked ? "line-through text-muted-foreground" : ""}`}>{label}</div>
                  </div>

                  {DETAIL_ACTIONS.has(id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExpand(id)}
                      className="rounded-full"
                    >
                      Open
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer controls */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setScreenIndex((screenIndex + 1) % SCREENS.length)}
            className="rounded-full"
          >
            Show different ideas
          </Button>

          {allChecked ? (
            <div className="text-sm text-green-600">All done here ✨</div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Pick one or two that feel doable
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
