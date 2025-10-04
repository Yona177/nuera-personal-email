import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { track } from "@/utils/analytics";
import { GratitudeEntry, GratitudeItem } from "@/types/gratitude";
import { saveGratitudeEntry } from "@/store/gratitude";
import { ArrowLeft } from "lucide-react";

const DEFAULT_CHIPS = ["Family","Friends","Work","Health","Learning","Nature","Home","Food","Creativity","Music","Luck","Other"];

export default function GratitudeNew() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);            // 0..2 for three items, 3 for savor, 4 done
  const [items, setItems] = useState<GratitudeItem[]>([
    { id: uuid(), what: "", category: "" },
    { id: uuid(), what: "", category: "" },
    { id: uuid(), what: "", category: "" },
  ]);
  const [moodBefore] = useState<number | undefined>(undefined);
  const [moodAfter, setMoodAfter] = useState<number | undefined>(undefined);

  const current = items[step] || null;
  const progress = useMemo(() => Math.min(3, step + 1), [step]);

  const setCurrent = (patch: Partial<GratitudeItem>) => {
    setItems(prev => prev.map((it, i) => i === step ? { ...it, ...patch } : it));
  };

  const goNext = () => {
    // require at least 'what' for steps 0..2
    if (step <= 2) {
      if (!current?.what?.trim()) return;
      if (step < 2) { setStep(step + 1); return; }
      setStep(3);  // savor
      return;
    }
    if (step === 3) { setStep(4); return; } // done
    if (step === 4) finish();
  };

  const finish = () => {
    const entry: GratitudeEntry = {
      id: uuid(),
      createdAt: Date.now(),
      items: items.filter(i => i.what?.trim()),
      moodBefore,
      moodAfter
    };
    saveGratitudeEntry(entry);
    track("gratitude_complete", { count: entry.items.length, moodBefore, moodAfter });
    nav(-1);
  };

  // simple “savor” bubble reused from breathing styles
  const savor = (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-2">Savor the moment</h2>
      <p className="text-muted-foreground mb-8">Close your eyes and replay one of your gratitudes for 10 seconds.</p>
      <div className="mx-auto my-6 h-40 w-40 rounded-full bg-card shadow-card animate-pulse" />
      <Button onClick={goNext} className="mt-2">Continue</Button>
    </div>
  );

  if (step >= 3) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-md p-6 pt-16">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => nav(-1)} className="h-10 w-10 rounded-full p-0"><ArrowLeft size={20}/></Button>
            <h2 className="text-lg font-semibold">Gratitude</h2>
            <div className="w-10" />
          </div>

          {step === 3 ? savor : (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">How do you feel now?</h2>
              <p className="text-muted-foreground mb-6">Slide to rate your mood after reflecting.</p>
              <input
                type="range"
                min={1} max={5}
                className="w-full mb-3"
                value={moodAfter ?? 3}
                onChange={e => setMoodAfter(parseInt(e.target.value))}
              />
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
                <span>1</span><span>…</span><span>5</span>
              </div>
              <Button onClick={finish}>Save</Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md p-6 pt-16">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => nav(-1)} className="h-10 w-10 rounded-full p-0"><ArrowLeft size={20}/></Button>
          <h2 className="text-lg font-semibold">Gratitude</h2>
          <div className="w-10" />
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-2 mb-6">
          {[0,1,2].map(i => (
            <div key={i} className={`h-2 w-10 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        <h1 className="text-2xl font-semibold mb-2">Thing {progress} of 3</h1>
        <p className="text-muted-foreground mb-5">Pick a topic, then add a quick note and why it mattered.</p>

        {/* Chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {DEFAULT_CHIPS.map(ch => {
            const active = (current?.category || "") === ch;
            return (
              <button
                key={ch}
                onClick={() => setCurrent({ category: ch === "Other" ? "" : ch })}
                className={`px-3 py-1 rounded-full text-sm border ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-accent'}`}
              >
                {ch}
              </button>
            );
          })}
        </div>

        {/* What (required) */}
        <div className="mb-4">
          <label className="block text-sm mb-1">What’s one thing you’re grateful for?</label>
          <Input
            value={current?.what || ""}
            onChange={e => setCurrent({ what: e.target.value })}
            placeholder="e.g., Coffee with Maya"
          />
        </div>

        {/* Why (optional) */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Why did it matter?</label>
          <Textarea
            value={current?.why || ""}
            onChange={e => setCurrent({ why: e.target.value })}
            placeholder="We reconnected and I felt supported."
            rows={3}
          />
        </div>

        {/* Who + tiny action (optional) */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Input
            value={current?.who || ""}
            onChange={e => setCurrent({ who: e.target.value })}
            placeholder="Who (optional)"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!current?.willAct}
              onChange={e => setCurrent({ willAct: e.target.checked })}
            />
            Send a thank-you later
          </label>
        </div>

        <Button onClick={goNext} className="w-full">Next</Button>
      </div>
    </div>
  );
}
