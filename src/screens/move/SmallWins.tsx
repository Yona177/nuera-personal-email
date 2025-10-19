import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/utils/analytics";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Labels & groups (same ideas as before, reworded slightly for brevity)
const GROUPS = [
  {
    id: "g1",
    title: "Quick lifts",
    items: [
      { id: "walk",      label: "Take a short walk", emoji: "🚶" },
      { id: "stretch",   label: "Stretch 2 minutes",  emoji: "🤸" },
      { id: "breathe",   label: "3 deep breaths",     emoji: "🫁" },
      { id: "song",      label: "Play a favorite song", emoji: "🎵" },
    ],
  },
  {
    id: "g2",
    title: "Tiny tidies",
    items: [
      { id: "tidy",     label: "Tidy a small spot",   emoji: "🧹" },
      { id: "organize", label: "Organize one thing",  emoji: "🗂️" },
      { id: "plants",   label: "Water your plants",   emoji: "🪴" },
      { id: "light",    label: "Soften the lights",   emoji: "🕯️" },
    ],
  },
  {
    id: "g3",
    title: "Social & mindset",
    items: [
      { id: "friend",   label: "Text/call a friend",  emoji: "📞" },
      { id: "gratitude",label: "Write one gratitude", emoji: "📝" },
      { id: "quote",    label: "Read a positive quote", emoji: "💬" },
      { id: "mirror",   label: "Smile in the mirror", emoji: "🪞" },
    ],
  },
];

// Short, practical guidance shown per action
const ACTION_DETAILS: Record<string, string> = {
  walk:      "Step outside; notice your steps & the air.",
  stretch:   "Roll shoulders; find tight spots; breathe slowly.",
  breathe:   "Inhale and exhale fully — three calm cycles.",
  song:      "Play a favorite track; let mood follow.",
  tidy:      "Clear one surface or corner. Tiny reset, big feel.",
  organize:  "Sort one small pile or drawer. Simple order helps.",
  plants:    "Water your plants. Notice their calm beauty.",
  light:     "Dim lights or light a candle; soften the space.",
  friend:    "Send a quick check-in to someone you like.",
  gratitude: "Write one good thing from today; linger on it.",
  quote:     "‘No rain, no flowers.’ Let it sit a moment.",
  mirror:    "Smile at yourself. You’re doing better than you think.",
};

type PickItem = { id: string; label: string; emoji?: string };

export default function SmallWins() {
  const nav = useNavigate();

  // Build a flat map of all items for quick lookup
  const ALL_ITEMS = useMemo<PickItem[]>(
    () => GROUPS.flatMap(g => g.items),
    []
  );
  const byId = useMemo<Record<string, PickItem>>(() => {
    const map: Record<string, PickItem> = {};
    ALL_ITEMS.forEach(i => (map[i.id] = i));
    return map;
  }, [ALL_ITEMS]);

  // UI state
  const [selected, setSelected] = useState<string[]>([]);
  const [queue, setQueue] = useState<string[]>([]);      // the running order for detail screens
  const [currentIdx, setCurrentIdx] = useState(0);       // index into queue
  const [celebrate, setCelebrate] = useState(false);

  // Toggle selection on checklist
  function toggle(id: string) {
    setSelected(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      track("move_select_toggle", { id, selected: next.includes(id) });
      return next;
    });
  }

  // Shuffle groups quickly (simple rotation) for novelty
  function shuffleGroups() {
    // rotate the GROUPS order presentation by moving first to end
    const first = GROUPS.shift();
    if (first) GROUPS.push(first);
    track("move_shuffle", {});
    // force a tiny tick by toggling state that references groups? not needed for functional display since we directly map GROUPS.
    // If you want a harder shuffle, you could randomize each group's items here.
  }

  // Start the flow
  function startSelected() {
    if (selected.length === 0) return;
    setQueue(selected);
    setCurrentIdx(0);
    track("move_start_batch", { count: selected.length, items: selected });
  }

  // Detail screen handlers
  const currentId = queue[currentIdx];
  const current = currentId ? byId[currentId] : undefined;

  function handleBackToList() {
    setQueue([]);
    setCurrentIdx(0);
  }

  function handleAccomplished() {
    const id = currentId;
    track("move_done", { action: id });
    const nextIdx = currentIdx + 1;
    if (nextIdx < queue.length) {
      setCurrentIdx(nextIdx);
    } else {
      // finished sequence
      setQueue([]);
      setCurrentIdx(0);
      setCelebrate(true);
    }
  }

  // 🎉 Celebration
  if (celebrate) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-background text-center p-6">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-3xl font-semibold mb-2">Nice work!</h2>
        <p className="text-muted-foreground mb-6">
          Those small wins really add up.
        </p>
        <Button
          onClick={() => {
            setSelected([]);
            setCelebrate(false);
            nav(-1); // back to previous screen (home/cards)
          }}
        >
          Back to Home
        </Button>
      </div>
    );
  }

  // 👉 Detail screen (step-through for selected items)
  if (current) {
    const detail = ACTION_DETAILS[current.id] || "Take a tiny step — then breathe.";
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-pink-50 p-6 pb-24">
        {/* Back button — consistent with other flows */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToList}
          className="absolute left-4 top-4 h-10 w-10 rounded-full p-0"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </Button>

        <div className="max-w-md mx-auto pt-16 text-center">
          <div className="mx-auto mb-5 h-20 w-20 rounded-full bg-white shadow-card grid place-items-center">
            <span className="text-3xl">{current.emoji ?? "✨"}</span>
          </div>

          <div className="mb-2 text-sm text-muted-foreground">
            Step {currentIdx + 1} of {queue.length}
          </div>

          <h1 className="text-2xl font-semibold mb-3">{current.label}</h1>
          <p className="text-muted-foreground mb-8">{detail}</p>

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={handleBackToList}
              className="rounded-full px-6"
            >
              Pick list
            </Button>
            <Button onClick={handleAccomplished} className="rounded-full px-6">
              Accomplished ✓
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 📝 Checklist screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-purple-50 p-6">
      {/* Back to previous (home/cards) */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.history.back()}
        className="absolute left-4 top-4 h-10 w-10 rounded-full p-0"
        aria-label="Back"
      >
        <ArrowLeft size={20} />
      </Button>

      <div className="mx-auto max-w-md pt-16">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-primary tracking-tight">Small Wins</h1>
          <p className="text-sm text-muted-foreground">Tiny actions that make a big lift.</p>
        </div>

        {/* Groups */}
        <div className="space-y-6">
          {GROUPS.map(group => (
            <div key={group.id} className="rounded-xl border bg-card/80 backdrop-blur px-4 py-3 shadow-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.title}
              </div>

              <ul className="divide-y divide-border/60">
                {group.items.map(item => {
                  const active = selected.includes(item.id);
                  return (
                    <li key={item.id} className="py-2">
                      <button
                        onClick={() => toggle(item.id)}
                        className="w-full flex items-center gap-3 text-left"
                      >
                        <span
                          className={
                            "grid h-6 w-6 place-items-center rounded-full border " +
                            (active ? "bg-primary text-primary-foreground border-primary" : "bg-white border-border")
                          }
                        >
                          {active ? "✓" : ""}
                        </span>
                        <span className="text-xl">{item.emoji}</span>
                        <span
                          className={
                            "flex-1 text-sm " +
                            (active ? "line-through text-muted-foreground" : "text-foreground")
                          }
                        >
                          {item.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={shuffleGroups}
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Shuffle suggestions
          </button>

          <Button
            disabled={selected.length === 0}
            onClick={startSelected}
            className="rounded-full"
          >
            Start selected {selected.length > 0 ? `(${selected.length})` : ""}
          </Button>
        </div>
      </div>
    </div>
  );
}
