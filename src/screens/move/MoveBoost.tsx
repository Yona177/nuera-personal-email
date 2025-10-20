import { useMemo, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info } from "lucide-react";
import { track } from "@/utils/analytics";
import { useNavigate } from "react-router-dom";

/**
 * MoveBoost = “Move Your Body” (BA + micro-movement)
 * Different from Small Wins: single focused module with
 * - brief rationale (“Why this helps”)
 * - picker of movement options
 * - simple timer + guidance
 * - optional references modal
 */

type Move = {
  id: string;
  title: string;
  durationSec: number;
  cues: string[];       // step-by-step short cues shown while the timer runs
  rationale: string;    // 1–2 lines “why this helps”
};

const MOVES: Move[] = [
  {
    id: "shadow_box",
    title: "Shadow boxing (1 min)",
    durationSec: 60,
    cues: [
      "Stand tall, soft knees.",
      "Light jabs across the body.",
      "Add a slow breath: in… out…",
      "Finish with gentle shoulder rolls."
    ],
    rationale: "Quick, rhythmic effort releases tension and raises arousal in a controlled way."
  },
  {
    id: "power_pose",
    title: "Power pose (2 min)",
    durationSec: 120,
    cues: [
      "Feet hip-width, chest open.",
      "Hands on hips or raised wide.",
      "Slow nasal breathing.",
      "Notice posture → mood shift."
    ],
    rationale: "Open, upright posture + slow breathing can nudge calm/agency signals."
  },
  {
    id: "wall_pushups",
    title: "Wall push-ups (10 reps)",
    durationSec: 75,
    cues: [
      "Hands on wall, step back.",
      "Lower with control (nose toward wall).",
      "Exhale up, 10 steady reps.",
      "Shake arms, breathe easy."
    ],
    rationale: "Gentle upper-body effort gives quick somatic feedback and accomplishment."
  },
  {
    id: "dance_60",
    title: "60-sec dance break",
    durationSec: 60,
    cues: [
      "Play a song in your head.",
      "Move freely—no rules.",
      "Loosen jaw/shoulders.",
      "Smile if it helps—keep it light."
    ],
    rationale: "Free movement + music imagery tends to lift affect fast."
  },
  {
    id: "micro_sprint",
    title: "Fast march (40s) + coast",
    durationSec: 70,
    cues: [
      "March in place 20–40s (arms swing).",
      "Then 30s easy sway/breathe.",
      "Finish with 3 deep breaths."
    ],
    rationale: "Brief intensity spike followed by recovery can reset energy."
  }
];

// simple mm:ss
function pretty(t: number) {
  const m = Math.floor(t / 60);
  const s = String(t % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function MoveBoost() {
  const nav = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [showRefs, setShowRefs] = useState(false);
  const tickRef = useRef<number | null>(null);

  const selected = useMemo(
    () => MOVES.find(m => m.id === selectedId) || null,
    [selectedId]
  );

  // start one move
  function startMove(id: string) {
    const m = MOVES.find(x => x.id === id)!;
    setSelectedId(id);
    setSecondsLeft(m.durationSec);
    setRunning(true);
    track("moveboost_start", { id });
  }

  // timer
  useEffect(() => {
    if (!running) return;
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = window.setInterval(() => {
      setSecondsLeft(s => {
        const n = Math.max(0, s - 1);
        if (n === 0) {
          clearInterval(tickRef.current!);
          tickRef.current = null;
          setRunning(false);
          track("moveboost_complete", { id: selectedId });
        }
        return n;
      });
    }, 1000) as unknown as number;
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, [running, selectedId]);

  const cueIndex = selected ? Math.min(
    selected.cues.length - 1,
    Math.floor(((selected.durationSec - secondsLeft) / Math.max(1, selected.durationSec)) * selected.cues.length)
  ) : 0;

  // Header + back
  const Header = (
    <div className="mb-6 flex items-center justify-between">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => nav(-1)}
        className="h-10 w-10 rounded-full p-0"
        aria-label="Back"
      >
        <ArrowLeft size={20} />
      </Button>
      <h2 className="text-lg font-semibold">Move Your Body</h2>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowRefs(true)}
        className="h-10 w-10 rounded-full p-0"
        aria-label="Why this helps"
      >
        <Info size={18} />
      </Button>
    </div>
  );

  // Picker screen
  if (!selected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-wellness-energy/10 via-background to-wellness-calm/10">
        <div className="mx-auto max-w-md p-6 pt-16">
          {Header}
          <div className="mb-2 text-2xl font-semibold">Quick mood lift</div>
          <p className="mb-6 text-muted-foreground">
            Pick one guided move. Short, doable, evidence-informed.
          </p>

          <div className="space-y-3">
            {MOVES.map(m => (
              <button
                key={m.id}
                onClick={() => startMove(m.id)}
                className="w-full rounded-xl border bg-card p-4 text-left shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{m.title}</div>
                    <div className="text-xs text-muted-foreground">{m.rationale}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{pretty(m.durationSec)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* References modal */}
        {showRefs && <RefsModal onClose={() => setShowRefs(false)} />}
      </div>
    );
  }

  // Runner screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-wellness-focus/10">
      <div className="mx-auto max-w-md p-6 pt-16">
        {Header}

        <h1 className="mb-2 text-2xl font-semibold">{selected.title}</h1>
        <p className="mb-6 text-muted-foreground">{selected.rationale}</p>

        {/* Timer + cue */}
        <div className="mx-auto mb-6 grid h-48 w-48 place-items-center rounded-full border-8 border-primary/20 bg-card shadow-card">
          <div className="text-center">
            <div className="text-4xl font-bold">{pretty(secondsLeft)}</div>
            <div className="mt-1 text-sm text-muted-foreground">Time left</div>
          </div>
        </div>

        <div className="mb-8 rounded-xl border bg-card p-4 text-center">
          <div className="text-sm text-muted-foreground">Cue</div>
          <div className="text-lg font-medium">{selected.cues[cueIndex] || selected.cues.at(-1)}</div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => { setSelectedId(null); setRunning(false); }}
          >
            Pick another
          </Button>
          <Button
            onClick={() => { setRunning(r => !r); }}
          >
            {running ? "Pause" : (secondsLeft === 0 ? "Restart" : "Resume")}
          </Button>
          {secondsLeft > 0 && (
            <Button
              variant="secondary"
              onClick={() => { setSecondsLeft(0); /* complete early */ }}
            >
              Finish now
            </Button>
          )}
        </div>
      </div>

      {/* References modal */}
      {showRefs && <RefsModal onClose={() => setShowRefs(false)} />}
    </div>
  );
}

function RefsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-5 shadow-2xl">
        <div className="mb-3 text-sm font-semibold">Why this helps (quick refs)</div>
        <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
          <li>
            Behavioral activation (schedule simple, rewarding actions) is an effective depression treatment and can be delivered in simple formats. 
            <a className="ml-1 underline" href="https://doaj.org/article/e5d020ef8e8f4b49a2d796fad590eb40" target="_blank" rel="noreferrer">Meta-analysis</a>.
          </li>
          <li>
            Single exercise bouts reliably boost positive affect shortly after activity. 
            <a className="ml-1 underline" href="https://www.sciencedirect.com/science/article/abs/pii/S1469029206000069" target="_blank" rel="noreferrer">Meta-analysis</a>.
          </li>
          <li>
            Recent reviews continue to support activity-first approaches as practical, scalable options for mood support.
            <a className="ml-1 underline" href="https://link.springer.com/article/10.1007/s00787-024-02429-3" target="_blank" rel="noreferrer">Review</a>.
          </li>
        </ul>
        <div className="mt-4 text-right">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
