import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { track } from "@/utils/analytics";
import { GratitudeEntry, GratitudeItem } from "@/types/gratitude";
import { saveGratitudeEntry } from "@/store/gratitude";
import { ArrowLeft } from "lucide-react";
import ThankYouPrompt from "@/components/modals/ThankYouPrompt";
import { buildThankYouMessage } from "@/utils/share";

const DEFAULT_CHIPS = ["Family","Friends","Work","Health","Learning","Nature","Home","Food","Creativity","Music","Luck","Other"];
const MAX_ITEMS = 3;

export default function GratitudeNew() {
  const nav = useNavigate();

  // itemIndex = which item we’re on (0..MAX_ITEMS-1)
  const [itemIndex, setItemIndex] = useState(0);
  const [items, setItems] = useState<GratitudeItem[]>([
    { id: uuid(), what: "", category: "" },
    { id: uuid(), what: "", category: "" },
    { id: uuid(), what: "", category: "" },
  ]);

  // Thank-you modal
  const [tyOpen, setTyOpen] = useState(false);
  const [tyMessage, setTyMessage] = useState("");

  // Completion step: after “add another?” flow, we show a short mood slider
  const [postMood, setPostMood] = useState<number | undefined>(undefined);
  const [showMood, setShowMood] = useState(false);

  useEffect(() => {
    track("gratitude_start", {});
  }, []);

  const current = items[itemIndex];
  const title = useMemo(() => {
    if (itemIndex === 0) return "Gratitude";
    return `Gratitude #${itemIndex + 1}`;
  }, [itemIndex]);

  const setCurrent = (patch: Partial<GratitudeItem>) => {
    setItems(prev => prev.map((it, i) => i === itemIndex ? { ...it, ...patch } : it));
  };

  function submitCurrent() {
    if (!current?.what?.trim()) return;

    // Build thank-you message (if who present or even if not)
    const message = buildThankYouMessage({
      who: current?.who?.trim() || undefined,
      what: current.what.trim(),
      why: current?.why?.trim() || undefined,
    });
    setTyMessage(message);
    setTyOpen(true);
  }

  function afterThankYou(channel: "sms" | "copy" | "skip" | "email") {
    track("gratitude_thanks_sent", { channel, hasWho: !!current?.who });

    // Ask to add another (unless we hit MAX_ITEMS)
    if (itemIndex < MAX_ITEMS - 1) {
      // Lightweight confirm UI
      const add = window.confirm(itemIndex === 0 ? "Add a second gratitude?" : "Add another gratitude?");
      if (add) {
        setItemIndex(itemIndex + 1);
        return; // stay in flow
      }
    }
    // Otherwise we’re done entering items → show mood slider
    setShowMood(true);
  }

  function finishAll() {
    const entry: GratitudeEntry = {
      id: uuid(),
      createdAt: Date.now(),
      items: items
        .slice(0, itemIndex + 1)
        .filter(i => i.what?.trim()),
      moodBefore: undefined, // not captured in this simplified flow
      moodAfter: postMood
    };
    saveGratitudeEntry(entry);
    track("gratitude_complete", {
      count: entry.items.length,
      moodAfter: postMood
    });
    nav(-1);
  }

  // Render: mood screen at the very end
  if (showMood) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-md p-6 pt-16 text-center">
          <h2 className="mb-2 text-2xl font-semibold">How do you feel now?</h2>
          <p className="mb-6 text-muted-foreground">Slide quickly to rate your mood after reflecting.</p>
          <input
            type="range"
            min={1}
            max={5}
            className="w-full mb-3"
            value={postMood ?? 3}
            onChange={e => setPostMood(parseInt(e.target.value))}
          />
          <div className="mb-8 text-xs text-muted-foreground">1 … 5</div>
          <Button onClick={finishAll}>Save</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md p-6 pt-16">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => nav(-1)} className="h-10 w-10 rounded-full p-0">
            <ArrowLeft size={20}/>
          </Button>
          <h2 className="text-lg font-semibold">Gratitude</h2>
          <div className="w-10" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-5">
          Pick a topic, add one thing, and (optionally) thank someone.
        </p>

        {/* Chips */}
        <div className="mb-5 flex flex-wrap gap-2">
          {DEFAULT_CHIPS.map(ch => {
            const active = (current?.category || "") === ch;
            return (
              <button
                key={ch}
                onClick={() => setCurrent({ category: ch === "Other" ? "" : ch })}
                className={`px-3 py-1 rounded-full text-sm border ${
                  active ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border hover:bg-accent'
                }`}
              >
                {ch}
              </button>
            );
          })}
        </div>

        {/* What (required) */}
        <div className="mb-4">
          <label className="mb-1 block text-sm">What’s one thing you’re grateful for?</label>
          <Input
            value={current?.what || ""}
            onChange={e => setCurrent({ what: e.target.value })}
            placeholder="e.g., Coffee with Maya"
          />
        </div>

        {/* Why (optional) */}
        <div className="mb-4">
          <label className="mb-1 block text-sm">Why did it matter?</label>
          <Textarea
            value={current?.why || ""}
            onChange={e => setCurrent({ why: e.target.value })}
            placeholder="We reconnected and I felt supported."
            rows={3}
          />
        </div>

        {/* Who (optional) */}
        <div className="mb-6 grid grid-cols-1 gap-3">
          <Input
            value={current?.who || ""}
            onChange={e => setCurrent({ who: e.target.value })}
            placeholder="Who (optional)"
          />
        </div>

        <Button
          className="w-full"
          onClick={() => {
            // Save the item to our in-memory list; analytics:
            if (!current?.what?.trim()) return;
            track("gratitude_item_saved", {
              category: current.category || "Uncategorized",
              hasWho: !!current.who,
              hasWhy: !!current.why
            });
            submitCurrent();
          }}
        >
          Submit
        </Button>
      </div>

      {/* Thank-you modal */}
      <ThankYouPrompt
        open={tyOpen}
        message={tyMessage}
        onSent={(channel) => afterThankYou(channel)}
        onClose={() => setTyOpen(false)}
      />
    </div>
  );
}
